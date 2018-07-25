const sql = require("mssql")
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

// config for your database
var config = {
    user: 'user',
    password: 'pass',
    server: 'lostmy-id.cgve6prjmy8d.ap-southeast-1.rds.amazonaws.com', //singapore aws rds
    database: 'LostIdentity' ,
    options: {
        encrypt: false,
    }
};

const app = express();

//Connection pool
const connection = new sql.ConnectionPool(config)
// create Request object
const dbRequest = new sql.Request(connection);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())
//cors
app.use(cors());
//host on the port below - nginxport on aws 8081
app.listen(8081);

// We are going to implement a JWT middleware that will ensure the validity of our token.
// We'll require each protected route to have a valid access_token sent in the Authorization header
const authCheck = jwt({
    secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: "https://lost.auth0.com/.well-known/jwks.json"
      }),
      // This is the identifier we set when we created the API
      audience: 'https://lost.auth0.com/api/v2/',
      issuer: "lost.auth0.com", // e.g., lost.auth0.com
      algorithms: ['RS256']
  });

//Get SUMMARY
app.get('/summary', function(req, resp){

    // connect to your database
    connection.connect(function (err) {
        
        if (!!err){
            console.log('Error in summary' + err);
        } else {
            console.log('connected');
        }

        const summaryQuery = `Select Count(*) as TotalRecords  from LostDocument;
        Select Count(Distinct(country)) as TotalCountries from LostDocument;
        Select Count(*) as TotalDocumentTypes FROM DocumentType;`;
        
        // query to the database and get the records
        dbRequest.query(summaryQuery, function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...!");
            } else {
                console.log(records.recordsets);
                resp.send(records.recordsets);
            }
            connection.close();
        });
    });
});

// Get all logged lost documents
app.get('/lostDocuments', function(req, resp){
    connection.connect(function(err) {
        if (!!err){
            console.log('Error in conn' + err);
        } else {
            console.log('connected');
        }

        const getAllDocsWithTypeName = "SELECT *, ld.Id as DocId, dt.Name as DocumentTypeName FROM [LostDocument] ld join DocumentType dt on dt.Id = ld.LostDocumentType_Id";

        dbRequest.query(getAllDocsWithTypeName, function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...!");
            } else {
                resp.send(records.recordset);
            }
            connection.close();
        });
    });
});

// get list of document types eg: Passport, PAN etc.
app.get('/documentTypes', function(req, resp){
    connection.connect(function(err) {
        if (!!err){
            console.log('Error in conn' + err);
        } else {
            console.log('connected');
        }

        const getAllDocTypes = "SELECT [Id], [Name] FROM [DocumentType]";

        dbRequest.query(getAllDocTypes, function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...!");
            } else {
                resp.send(records.recordset);
            }
            connection.close();
        });
    });
});

//get document by Id
app.get('/lostDocuments/:id', function(req, resp){
    
    console.log('id is......' + req.params.id);
    const userId = req.params.id;
    connection.connect(function(err) {
        if (!!err){
            console.log('Error in conn' + err);
        } else {
            console.log('connected');
        }

        const getDocWithTypeName = "SELECT *, ld.Id as DocId, dt.Name as DocumentTypeName FROM [LostDocument] ld join DocumentType dt on dt.Id = ld.LostDocumentType_Id where ld.ID=";

        dbRequest.query((getDocWithTypeName + userId), function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...!");
            } else {
                resp.send(records.recordset[0]);
            }
            connection.close();
        });
    });
});

//search documents
app.get('/searchDocuments/', function(req, resp){
    
    console.log('params are.....');
    console.log(req.query);
    const docNumber = req.query.docNumber;
    const docTypeId = req.query.docType;
    const givenName = req.query.givenName;
    const country = req.query.country;

    connection.connect(function(err) {
        if (!!err){
            console.log('Error in searching...' + err);
        } else {
            console.log('connected');
        }

        console.log(`${docTypeId}....${docNumber}....${givenName}.....${country}....`);

        const searchQuery = `SELECT *, ld.Id as DocId, dt.Name as DocumentTypeName FROM [LostDocument] ld join DocumentType dt on dt.Id = ld.LostDocumentType_Id
        WHERE ld.LostDocumentType_Id = ${docTypeId}
        ${addFilterToSearch('DocumentNumber', docNumber, docTypeId != null)}
        ${addFilterToSearch('GivenName', givenName, docTypeId != null && docNumber != null)}
        ${addFilterToSearch('Country', country, docTypeId != null && docNumber != null && givenName != null)}`;
    
        console.log("returnIdQuery query..." + searchQuery);

        dbRequest.query((searchQuery), function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...!");
            } else {
                resp.send(records.recordset);
            }
            connection.close();
        });
    });
});

//search documents count
app.get('/searchDocumentsCount/', function(req, resp){
    
    const docNumber = req.query.docNumber;
    const docTypeId = req.query.docType;
    const givenName = req.query.givenName;
    const country = req.query.country;

    connection.connect(function(err) {
        if (!!err){
            console.log('Error in searching...' + err);
        } else {
            console.log('connected');
        }

        console.log(`${docTypeId}....${docNumber}....${givenName}.....${country}....`);

        const searchQuery = `SELECT COUNT(*) as searchCount FROM [LostDocument] ld join DocumentType dt on dt.Id = ld.LostDocumentType_Id
        WHERE ld.LostDocumentType_Id = ${docTypeId}
        ${addFilterToSearch('DocumentNumber', docNumber, docTypeId != null)}
        ${addFilterToSearch('GivenName', givenName, docTypeId != null && docNumber != null)}
        ${addFilterToSearch('Country', country, docTypeId != null && docNumber != null && givenName != null)}`;
    
        console.log("returnIdQuery query..." + searchQuery);

        dbRequest.query((searchQuery), function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...!");
            } else {
                console.log(records.recordset[0]);
                resp.send(records.recordset[0]);
            }
            connection.close();
        });
    });
});

// insert document details and return the inserted Id
app.post('/createDocument', function(req, resp){
    
    console.log(req.body);
    const document = req.body;

    connection.connect(function(err) {
        if (!!err){
            console.log('Error in conn' + err);
        } else {
            console.log('connected');
        }

        const addDocumentQuery = `INSERT INTO [dbo].[LostDocument]
        ([DocumentNumber]
        ,[GivenName]
        ,[ValidityDate]
        ,[IssuedOn]
        ,[Address]
        ,[Sex]
        ,[DateOfBirth]
        ,[FoundLocality]
        ,[LostDocumentType_Id]
        ,[Country]
        ,[SubmitterEmail]
        ,[CreatedDate])
  VALUES
        ('${document.documentNumber}'
        ,'${document.givenName}'
        , ${document.validityDate ? covertToDateFormat(document.validityDate) : null}
        , ${document.issuedOn ? covertToDateFormat(document.issuedOn) : null}
        ,'${document.address}'
        ,'${document.sex}'
        , ${document.dateOfBirth ? covertToDateFormat(document.dateOfBirth) : null}
        ,'${document.foundLocality}'
        , ${document.documentType}
        ,'${document.country}'
        ,'${document.submitterEmail}'
        , GETDATE());
        SELECT SCOPE_IDENTITY() AS id`;

        console.log("Insert query..." + addDocumentQuery);

        dbRequest.query((addDocumentQuery), function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...insert failed!");
            } else {
                console.log('records.insertId query...####');
                console.log(records);
                resp.send(records.recordset);
            }
            connection.close();
        });
    });
});

function covertToDateFormat(dateField) {
    return `'${dateField}'`;
}

function addFilterToSearch(columnName, columnValue, prependAnd){
    const andFilter = prependAnd ? 'AND' : "";
    if (columnValue != null && columnValue != ""){
        return `${andFilter} ${columnName} like '%${columnValue}%'`;
    }else{
        return `${andFilter} 1=1`;
    }
}