"""create_media_table

Revision ID: 8a40b0eaf476
Revises: 9bf6e155d864
Create Date: 2025-08-29 13:04:15.973401

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a40b0eaf476'
down_revision: Union[str, Sequence[str], None] = '9bf6e155d864'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create media table
    op.create_table('media',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('incident_id', sa.Integer(), nullable=False),
        sa.Column('media_type', sa.String(length=32), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_size', sa.BigInteger(), nullable=False),
        sa.Column('mime_type', sa.String(length=128), nullable=False),
        sa.Column('file_path', sa.String(length=512), nullable=False),
        sa.Column('thumbnail_path', sa.String(length=512), nullable=True),
        sa.Column('caption', sa.String(length=512), nullable=True),
        sa.Column('alt_text', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_media_incident_id', 'media', ['incident_id'])
    op.create_index('ix_media_media_type', 'media', ['media_type'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index('ix_media_media_type', table_name='media')
    op.drop_index('ix_media_incident_id', table_name='media')
    
    # Drop table
    op.drop_table('media')
