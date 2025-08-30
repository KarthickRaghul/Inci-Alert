"""Add password reset fields to user

Revision ID: add_reset_fields
Revises: 652294206bf2
Create Date: 2025-08-29 14:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'add_reset_fields'
down_revision: Union[str, Sequence[str], None] = '652294206bf2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add password reset fields to users table."""
    # Add reset_token column
    op.add_column('users', sa.Column('reset_token', sa.String(128), nullable=True))
    
    # Add reset_token_expires column
    op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Remove password reset fields from users table."""
    # Drop reset_token_expires column
    op.drop_column('users', 'reset_token_expires')
    
    # Drop reset_token column
    op.drop_column('users', 'reset_token')
