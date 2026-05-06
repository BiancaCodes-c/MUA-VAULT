from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta

from src.scripts.export_appointments import run as export_run
from src.scripts.export_utils import run_data_quality_checks
from src.scripts.notify import notify_on_failure, notify_on_success


@task(retries=2, retry_delay_seconds=60)
def run_export_task():
    return export_run()


@task
def dq_task(parquet_path):
    issues = run_data_quality_checks(parquet_path)
    return issues


@flow(name="daily-appointments-export", retry_delay_seconds=120)
def daily_export_flow():
    parquet = run_export_task()
    issues = dq_task(parquet)
    if issues:
        notify_on_failure(f"Prefect flow: data-quality issues: {issues}")
        raise Exception(f"Data-quality issues: {issues}")
    notify_on_success(f"Prefect flow: export succeeded: {parquet}")


if __name__ == "__main__":
    daily_export_flow()
