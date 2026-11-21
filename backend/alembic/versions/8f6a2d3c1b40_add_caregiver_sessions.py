"""add caregiver sessions

Revision ID: 8f6a2d3c1b40
Revises: b032d1e7c941
Create Date: 2026-11-22
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '8f6a2d3c1b40'
down_revision: Union[str, Sequence[str], None] = 'b032d1e7c941'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'caregiver_sessions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('session_hash', sa.String(length=64), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_hash'),
    )
    op.create_index(op.f('ix_caregiver_sessions_user_id'), 'caregiver_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_caregiver_sessions_expires_at'), 'caregiver_sessions', ['expires_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_caregiver_sessions_expires_at'), table_name='caregiver_sessions')
    op.drop_index(op.f('ix_caregiver_sessions_user_id'), table_name='caregiver_sessions')
    op.drop_table('caregiver_sessions')
