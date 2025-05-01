import os


def reset_migrations():
    """
    Elimina los archivos de migraciones de las aplicaciones especificadas,
    excepto el archivo __init__.py.
    """
    # Directorio base del proyecto (donde está manage.py)
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Lista de aplicaciones con migraciones
    apps = ['usuarios', 'objetos', 'rentas', 'pagos', 'chats']

    print("🔄 Iniciando reseteo de migraciones...")

    # Eliminar archivos de migraciones excepto __init__.py
    for app in apps:
        migration_dir = os.path.join(base_dir, app, 'migrations')
        if os.path.exists(migration_dir):
            print(f"📁 Procesando {app}/migrations...")

            # Listar todos los archivos en el directorio de migraciones
            for filename in os.listdir(migration_dir):
                file_path = os.path.join(migration_dir, filename)

                # Excluir __init__.py y directorios
                if filename != '__init__.py' and os.path.isfile(file_path):
                    try:
                        os.remove(file_path)
                        print(f"   ✅ Borrado: {filename}")
                    except Exception as e:
                        print(f"   ❌ Error al borrar {filename}: {str(e)}")
        else:
            print(f"⚠️ El directorio {migration_dir} no existe.")

    print("\n🗑️ Limpieza de migraciones completada.")


if __name__ == "__main__":
    # Confirmación del usuario
    print("⚠️  ADVERTENCIA ⚠️")
    print("Este script eliminará todas las migraciones existentes.")
    confirm = input("¿Deseas continuar? [s/N]: ")

    if confirm.lower() == 's':
        reset_migrations()
    else:
        print("Operación cancelada.")
