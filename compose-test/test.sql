CREATE ROLE admingroup, operation_manager, operation_viewer;
GRANT ALL ON airflow_db.* TO admingroup;
GRANT SELECT ON airflow_db.* TO operation_viewer;
GRANT SELECT ON airflow_db.* TO operation_manager;
GRANT INSERT, UPDATE, DELETE ON airflow_db.* TO operation_manager;
CREATE USER airflowadmin IDENTIFIED BY 'airflowadmin@123';
CREATE USER talendsrv IDENTIFIED BY 'talendsrv@123';
CREATE USER airflowuser IDENTIFIED BY 'airflowuser@123';
GRANT admingroup TO airflowadmin;
GRANT operation_viewer TO airflowuser;
GRANT operation_manager TO talendsrv;
SET DEFAULT ROLE ALL TO airflowadmin;
SET DEFAULT ROLE ALL TO talendsrv;
SET DEFAULT ROLE ALL TO airflowuser;
