"""replace kind with icon jsonb

Revision ID: a2b3c4d5e6f7
Revises: c8f3e291a042
Create Date: 2026-06-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'a2b3c4d5e6f7'
down_revision = 'c8f3e291a042'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('plants', sa.Column('icon', postgresql.JSONB(), nullable=True))

    # Migrate existing kind values to IconRecipe records
    op.execute("""
        UPDATE plants SET icon = CASE kind::text
            WHEN 'monstera'   THEN '{"base": "fenestrated-tropical"}'::jsonb
            WHEN 'fig'        THEN '{"base": "single-trunk-tree"}'::jsonb
            WHEN 'pothos'     THEN '{"base": "trailing-vine"}'::jsonb
            WHEN 'snake'      THEN '{"base": "upright-sword"}'::jsonb
            WHEN 'succulent'  THEN '{"base": "rosette-succulent"}'::jsonb
            ELSE NULL
        END
        WHERE kind IS NOT NULL
    """)

    op.drop_column('plants', 'kind')
    op.execute("DROP TYPE IF EXISTS plantkind")


def downgrade():
    op.execute(
        "CREATE TYPE plantkind AS ENUM ('monstera', 'fig', 'pothos', 'snake', 'succulent')"
    )
    op.add_column(
        'plants',
        sa.Column('kind', sa.Enum('monstera', 'fig', 'pothos', 'snake', 'succulent',
                                  name='plantkind'), nullable=True)
    )
    op.execute("""
        UPDATE plants SET kind = CASE (icon->>'base')
            WHEN 'fenestrated-tropical' THEN 'monstera'::plantkind
            WHEN 'single-trunk-tree'    THEN 'fig'::plantkind
            WHEN 'trailing-vine'        THEN 'pothos'::plantkind
            WHEN 'upright-sword'        THEN 'snake'::plantkind
            WHEN 'rosette-succulent'    THEN 'succulent'::plantkind
            ELSE NULL
        END
        WHERE icon IS NOT NULL
    """)
    op.drop_column('plants', 'icon')
