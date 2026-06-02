"""auth overhaul: argon2, roles, citext, refresh tokens

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-02

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS citext")

    # Rename hashed_password -> password_hash
    op.alter_column("users", "hashed_password", new_column_name="password_hash")

    # Convert email to case-insensitive
    op.execute("ALTER TABLE users ALTER COLUMN email TYPE CITEXT USING email::citext")

    # Add role column; migrate is_admin data; drop is_admin
    op.add_column("users", sa.Column("role", sa.String(20), nullable=False, server_default="operator"))
    op.execute("UPDATE users SET role = 'admin' WHERE is_admin = true")
    op.drop_column("users", "is_admin")

    # Add new timestamp and flag columns
    op.add_column("users", sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("is_password_temp", sa.Boolean(), nullable=False, server_default="false"))

    # Backfill display_name to empty string for NOT NULL safety (column stays nullable per spec)


def downgrade() -> None:
    op.drop_column("users", "is_password_temp")
    op.drop_column("users", "last_login_at")
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"))
    op.execute("UPDATE users SET is_admin = true WHERE role = 'admin'")
    op.drop_column("users", "role")
    op.execute("ALTER TABLE users ALTER COLUMN email TYPE VARCHAR USING email::varchar")
    op.alter_column("users", "password_hash", new_column_name="hashed_password")
