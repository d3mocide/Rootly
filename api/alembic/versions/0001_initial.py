"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE plantkind AS ENUM ('monstera', 'fig', 'pothos', 'snake', 'succulent');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE plantstatus AS ENUM ('dry', 'soon', 'thriving', 'watered', 'resting');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "plants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("species", sa.String(), nullable=False, server_default=""),
        sa.Column("kind", postgresql.ENUM(name="plantkind", create_type=False), nullable=False),
        sa.Column("room", sa.String(), nullable=False, server_default=""),
        sa.Column("moisture", sa.Float(), nullable=False, server_default="0.5"),
        sa.Column("status", postgresql.ENUM(name="plantstatus", create_type=False), nullable=False, server_default="thriving"),
        sa.Column("every", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("light", sa.String(), nullable=False, server_default=""),
        sa.Column("note", sa.String(), nullable=False, server_default=""),
        sa.Column("growth", postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("last_water", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("plants")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE plantstatus")
    op.execute("DROP TYPE plantkind")
