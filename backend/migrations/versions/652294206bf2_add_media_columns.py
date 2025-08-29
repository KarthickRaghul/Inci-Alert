"""add_media_columns

Revision ID: 652294206bf2
Revises: 8a40b0eaf476
Create Date: 2025-08-29 13:07:24.844950

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '652294206bf2'
down_revision: Union[str, Sequence[str], None] = '8a40b0eaf476'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing columns to media table."""
    # Add missing columns
    op.add_column('media', sa.Column('media_type', sa.String(length=32), nullable=False, server_default='image'))
    op.add_column('media', sa.Column('original_filename', sa.String(length=255), nullable=False, server_default=''))
    op.add_column('media', sa.Column('file_size', sa.BigInteger(), nullable=False, server_default='0'))
    op.add_column('media', sa.Column('mime_type', sa.String(length=128), nullable=False, server_default=''))
    op.add_column('media', sa.Column('file_path', sa.String(length=512), nullable=False, server_default=''))
    op.add_column('media', sa.Column('thumbnail_path', sa.String(length=512), nullable=True))
    op.add_column('media', sa.Column('caption', sa.String(length=512), nullable=True))
    op.add_column('media', sa.Column('alt_text', sa.String(length=512), nullable=True))
    op.add_column('media', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    
    # Rename uploaded_at to created_at if needed
    op.alter_column('media', 'uploaded_at', new_column_name='created_at')
    
    # Create indexes
    op.create_index('ix_media_media_type', 'media', ['media_type'])


def downgrade() -> None:
    """Remove added columns."""
    op.drop_index('ix_media_media_type', table_name='media')
    op.alter_column('media', 'created_at', new_column_name='uploaded_at')
    op.drop_column('media', 'updated_at')
    op.drop_column('media', 'alt_text')
    op.drop_column('media', 'caption')
    op.drop_column('media', 'thumbnail_path')
    op.drop_column('media', 'file_path')
    op.drop_column('media', 'mime_type')
    op.drop_column('media', 'file_size')
    op.drop_column('media', 'original_filename')
    op.drop_column('media', 'media_type')
