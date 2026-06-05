"""add units preference to users

Revision ID: e7a1b2c3d4e5
Revises: d1e2f3g4h5i6
Create Date: 2026-06-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e7a1b2c3d4e5"
down_revision: Union[str, None] = "d1e2f3g4h5i6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("units", sa.String(length=10), nullable=False, server_default="imperial"),
    )


def downgrade() -> None:
    op.drop_column("users", "units")
