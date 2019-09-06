docker-compose -f CeleryAirflow.yml up -d && sleep 2m;echo "end of sleep-2m,docker-platform is up"
docker exec -i mysql_container mysql -uroot -ptoday123 < test.sql
echo "Created ROLES: 'admingroup', 'operation_viewer', 'operation_manager' with respective permissions.
Created USERS: 'airflowadmin', 'airflowuser', 'talendsrv'.
Granted Role 'admingroup' to User 'airflowadmin'.
Granted Role 'operation_viewer' to User 'airflowuser'.
Granted Role 'operation_manager' to User 'talendsrv'."
docker exec -it airflow_webserver airflow create_user -r Admin -u admin -e admin@example.com -f admin -l user -p admin@123
