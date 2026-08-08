"""add extra_stops to deliveries

Revision ID: 001_add_extra_stops
Revises: 
Create Date: 2026-08-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_extra_stops'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('deliveries', sa.Column('extra_stops', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('deliveries', 'extra_stops')
