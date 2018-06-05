USE [LostIdentity]
GO

/****** Object:  Table [dbo].[LostDocument]    Script Date: 5/06/2018 7:21:23 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[LostDocument](
	[CountryId] [int] NOT NULL,
	[DocumentNumber] [varchar](250) NOT NULL,
	[GivenName] [varchar](500) NOT NULL,
	[ValidityDate] [date] NULL,
	[IssuedOn] [date] NULL,
	[Address] [varchar](1000) NULL,
	[Sex] [varchar](20) NULL,
	[DateOfBirth] [date] NULL,
	[FoundLocality] [varchar](500) NULL,
	[LostDocumentType_Id] [int] NOT NULL DEFAULT ((0)),
	[Id] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_LostDocument] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[LostDocument]  WITH CHECK ADD  CONSTRAINT [fk_LostDocumentType_Id] FOREIGN KEY([LostDocumentType_Id])
REFERENCES [dbo].[DocumentType] ([Id])
GO

ALTER TABLE [dbo].[LostDocument] CHECK CONSTRAINT [fk_LostDocumentType_Id]
GO


