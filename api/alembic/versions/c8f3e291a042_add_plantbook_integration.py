"""add plantbook integration

Revision ID: c8f3e291a042
Revises: 5f935c60e5a8
Create Date: 2026-06-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "c8f3e291a042"
down_revision: Union[str, None] = "5f935c60e5a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "plant_profiles",
        sa.Column("pid", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False),
        sa.Column("alias", sa.String(), nullable=False, server_default=""),
        sa.Column("min_soil_moist", sa.Float(), nullable=True),
        sa.Column("max_soil_moist", sa.Float(), nullable=True),
        sa.Column("min_light_lux", sa.Integer(), nullable=True),
        sa.Column("max_light_lux", sa.Integer(), nullable=True),
        sa.Column("min_temp", sa.Float(), nullable=True),
        sa.Column("max_temp", sa.Float(), nullable=True),
        sa.Column("min_env_humid", sa.Float(), nullable=True),
        sa.Column("max_env_humid", sa.Float(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=False, server_default=""),
        sa.Column("fetched_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("pid"),
    )

    # Make kind nullable so new plants added via PlantBook don't require a kind
    op.alter_column(
        "plants", "kind",
        existing_type=postgresql.ENUM("monstera", "fig", "pothos", "snake", "succulent", name="plantkind"),
        nullable=True,
    )

    op.add_column("plants", sa.Column("plantbook_pid", sa.String(), sa.ForeignKey("plant_profiles.pid"), nullable=True))
    op.add_column("plants", sa.Column("min_light_lux", sa.Integer(), nullable=True))
    op.add_column("plants", sa.Column("max_light_lux", sa.Integer(), nullable=True))
    op.add_column("plants", sa.Column("min_temp", sa.Float(), nullable=True))
    op.add_column("plants", sa.Column("max_temp", sa.Float(), nullable=True))
    op.add_column("plants", sa.Column("min_env_humid", sa.Float(), nullable=True))
    op.add_column("plants", sa.Column("max_env_humid", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("plants", "max_env_humid")
    op.drop_column("plants", "min_env_humid")
    op.drop_column("plants", "max_temp")
    op.drop_column("plants", "min_temp")
    op.drop_column("plants", "max_light_lux")
    op.drop_column("plants", "min_light_lux")
    op.drop_column("plants", "plantbook_pid")

    op.alter_column(
        "plants", "kind",
        existing_type=postgresql.ENUM("monstera", "fig", "pothos", "snake", "succulent", name="plantkind"),
        nullable=False,
    )

    op.drop_table("plant_profiles")
