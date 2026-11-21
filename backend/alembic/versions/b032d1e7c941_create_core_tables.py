"""create the five MVP tables

Revision ID: b032d1e7c941
Revises: a994404c009f
Create Date: 2026-11-22
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b032d1e7c941'
down_revision: Union[str, Sequence[str], None] = 'a994404c009f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table(
        'patients',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('caregiver_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('preferred_language', sa.String(length=10), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('access_token', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['caregiver_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_patients_access_token'), 'patients', ['access_token'], unique=True)
    op.create_index(op.f('ix_patients_caregiver_id'), 'patients', ['caregiver_id'], unique=False)
    op.create_table(
        'medications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('strength', sa.String(length=100), nullable=True),
        sa.Column('dosage_instructions', sa.String(length=255), nullable=True),
        sa.Column('purpose', sa.String(length=255), nullable=True),
        sa.Column('photo_url', sa.String(length=1024), nullable=True),
        sa.Column('prescription_notes', sa.Text(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_medications_patient_id'), 'medications', ['patient_id'], unique=False)
    op.create_table(
        'schedules',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('medication_id', sa.Integer(), nullable=False),
        sa.Column('times', sa.JSON(), nullable=False),
        sa.Column('food_instruction', sa.String(length=50), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['medication_id'], ['medications.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_schedules_medication_id'), 'schedules', ['medication_id'], unique=False)
    op.create_table(
        'dose_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('medication_id', sa.Integer(), nullable=False),
        sa.Column('schedule_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('acted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('acted_by', sa.String(length=50), nullable=True),
        sa.Column('client_event_id', sa.String(length=128), nullable=True),
        sa.ForeignKeyConstraint(['medication_id'], ['medications.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['schedule_id'], ['schedules.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('client_event_id'),
        sa.UniqueConstraint('schedule_id', 'scheduled_at', name='uq_schedule_scheduled_at'),
    )
    op.create_index(op.f('ix_dose_logs_medication_id'), 'dose_logs', ['medication_id'], unique=False)
    op.create_index(op.f('ix_dose_logs_patient_id'), 'dose_logs', ['patient_id'], unique=False)
    op.create_index(op.f('ix_dose_logs_schedule_id'), 'dose_logs', ['schedule_id'], unique=False)
    op.create_index(op.f('ix_dose_logs_scheduled_at'), 'dose_logs', ['scheduled_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_dose_logs_scheduled_at'), table_name='dose_logs')
    op.drop_index(op.f('ix_dose_logs_schedule_id'), table_name='dose_logs')
    op.drop_index(op.f('ix_dose_logs_patient_id'), table_name='dose_logs')
    op.drop_index(op.f('ix_dose_logs_medication_id'), table_name='dose_logs')
    op.drop_table('dose_logs')
    op.drop_index(op.f('ix_schedules_medication_id'), table_name='schedules')
    op.drop_table('schedules')
    op.drop_index(op.f('ix_medications_patient_id'), table_name='medications')
    op.drop_table('medications')
    op.drop_index(op.f('ix_patients_caregiver_id'), table_name='patients')
    op.drop_index(op.f('ix_patients_access_token'), table_name='patients')
    op.drop_table('patients')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
