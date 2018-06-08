const sql = require('mssql/msnodesqlv8')
const express = require('express')
const bodyParser = require('body-parser')

const connectionString = "server=.\\MSSQL2014;Database=LostIdentity;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

const connection = new sql.ConnectionPool(connectionString);
const dbRequest = new sql.Request(connection);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Get all users
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
        ,[Country])
  VALUES
        ('${document.documentNumber}'
        ,'${document.givenName}'
        ,${document.validityDate ? document.validityDate : null}
        ,${document.issuedOn ? document.issuedOn : null}
        ,'${document.address}'
        ,'${document.sex}'
        ,${document.dateOfBirth ? document.dateOfBirth : null}
        ,'${document.foundLocality}'
        ,${document.documentType}
        ,'${document.country}')`

        console.log("Insert query..." + addDocumentQuery);

        dbRequest.query((addDocumentQuery), function(err, records){
            if (!!err){
                console.log('Error in query' + err);
                resp.send("oops...insert failed!");
            } else {
                resp.send({message: "Identity logged!"});
            }
            connection.close();
        });
    });
});

app.listen(3000);