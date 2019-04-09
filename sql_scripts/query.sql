DROP TABLE IF EXISTS DashboardPreference;
DROP TABLE IF EXISTS WidgetPreference;
DROP TABLE IF EXISTS TenantDataSource;
DROP TABLE IF EXISTS DataSource;
DROP TABLE IF EXISTS Template;
DROP TABLE IF EXISTS WidgetMaster;
DROP TABLE IF EXISTS UserDashboard;
DROP TABLE IF EXISTS DashboardWidgets;
DROP TABLE IF EXISTS Dashboard;
DROP TABLE IF EXISTS UserDetail;
DROP TABLE IF EXISTS Tenant;

CREATE TABLE Tenant(
TenantId INT IDENTITY(1,1) PRIMARY KEY,
TenantName NVARCHAR(100) NOT NULL UNIQUE,
UserGroupId INT NOT NULL
);

CREATE TABLE DataSource(
DataSourceId INT IDENTITY(1,1) PRIMARY KEY,
DataSourceName NVARCHAR(100) NOT NULL UNIQUE,
RefreshTime INT NOT NULL,
RetryFrequency INT NOT NULL,
APIConfigJson NVARCHAR(max) NOT NULL
);

CREATE TABLE TenantDataSource(
TenantId INT REFERENCES Tenant (TenantId),
DataSourceId INT REFERENCES DataSource (DataSourceId),
PRIMARY KEY (TenantId,DataSourceId)
);

CREATE TABLE WidgetMaster(
WidgetMasterId INT IDENTITY(1,1),
TenantId INT REFERENCES Tenant (TenantId),
WidgetName NVARCHAR(100) NOT NULL,
WidgetType NVARCHAR(100) NOT NULL,
WidgetConfigJson NVARCHAR(max) NOT NULL
PRIMARY KEY (TenantId,WidgetMasterId)
);

CREATE TABLE Template(
TemplateId INT IDENTITY(1,1),
TenantId INT REFERENCES Tenant (TenantId),
TemplateName NVARCHAR(100) NOT NULL,
TemplateWidgetsJson NVARCHAR(max) NOT NULL,
PRIMARY KEY (TenantId,TemplateId)
);

CREATE TABLE UserDetail(
UserId INT IDENTITY(1,1) PRIMARY KEY,
UserName NVARCHAR(100) NOT NULL,
Email NVARCHAR(256) NOT NULL UNIQUE,
Password NVARCHAR(100) NOT NULL,
UserGroupId INT NOT NULL
);

CREATE TABLE Dashboard(
DashboardId INT IDENTITY(1,1) PRIMARY KEY,
DashboardName NVARCHAR(50) NOT NULL UNIQUE,
LastUpdatedTime DATETIME2
);

CREATE TABLE UserDashboard(
UserId INT NOT NULL,
DashboardId INT REFERENCES Dashboard (DashboardId) ON DELETE CASCADE
PRIMARY KEY (UserId,DashboardId)
);

CREATE TABLE DashboardWidgets (
WidgetsId INT IDENTITY(1,1) ,
DashboardId INT REFERENCES Dashboard (DashboardId) ON DELETE CASCADE,
DashboardWidgetsJson NVARCHAR(max) NOT NULL,
PRIMARY KEY (WidgetsId,DashboardId)
);

CREATE TABLE DashboardPreference (
DashboardPreferenceId INT IDENTITY(1,1) PRIMARY KEY,
UserId INT NOT NULL,
DashboardId INT REFERENCES Dashboard (DashboardId) ON DELETE CASCADE,
DashboardPreferenceJson NVARCHAR(max) NOT NULL,
DefaultDashboard BIT NOT NULL,
);

CREATE TABLE WidgetPreference (
WidgetPreferenceId INT IDENTITY(1,1) PRIMARY KEY,
UserId INT NOT NULL,
WidgetsId INT NOT NULL,
DashboardId INT NOT NULL,
WidgetPreferenceJson NVARCHAR(max) NOT NULL,
FOREIGN KEY(WidgetsId, DashboardId) REFERENCES DashboardWidgets(WidgetsId, DashboardId) ON DELETE CASCADE,    
);

INSERT dbo.Tenant (TenantName,UserGroupId) VALUES ('softura',1)
INSERT dbo.UserDetail (UserName,Email,Password,UserGroupId) VALUES ('admin','admin@softura.com','admin@123',1)

