# flake8: noqa
import os
from google.cloud.sql.connector import Connector, IPTypes
import pymysql


def get_cloud_sql_connection():
    """
    Configura una conexión a Google Cloud SQL usando el conector de Python.
    """
    instance_connection_name = os.getenv("CLOUD_SQL_CONNECTION_NAME")  # e.g. 'project:region:instance'
    db_user = os.getenv("DB_USER")  # e.g. 'my-db-user'
    db_pass = os.getenv("DB_PASSWORD")  # e.g. 'my-db-password'
    db_name = os.getenv("DB_NAME")  # e.g. 'my-database'

    ip_type = IPTypes.PRIVATE if os.getenv("PRIVATE_IP") else IPTypes.PUBLIC

    # Inicializa el conector de Cloud SQL
    connector = Connector(ip_type=ip_type, refresh_strategy="LAZY")

    def getconn():
        conn = connector.connect(
            instance_connection_name,
            "pymysql",
            user=db_user,
            password=db_pass,
            db=db_name,
        )
        return conn

    return getconn