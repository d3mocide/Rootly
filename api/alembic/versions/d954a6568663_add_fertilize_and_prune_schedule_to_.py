"""add fertilize and prune schedule to plants

Revision ID: d954a6568663
Revises: e7a1b2c3d4e5
Create Date: 2026-06-06 15:39:01.680049

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'd954a6568663'
down_revision: Union[str, None] = 'e7a1b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('plants', sa.Column('last_fertilize', sa.DateTime(), nullable=True))
    op.add_column('plants', sa.Column('fertilize_every', sa.Integer(), nullable=True))
    op.add_column('plants', sa.Column('last_prune', sa.DateTime(), nullable=True))
    op.add_column('plants', sa.Column('prune_every', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('plants', 'prune_every')
    op.drop_column('plants', 'last_prune')
    op.drop_column('plants', 'fertilize_every')
    op.drop_column('plants', 'last_fertilize')
