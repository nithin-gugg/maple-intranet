"""Rename SCORM tables to Learning tables

Revision ID: 883bfe993cff
Revises: 80dbde4b1d78
Create Date: 2026-08-13 23:16:33.859994

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '883bfe993cff'
down_revision: Union[str, Sequence[str], None] = '80dbde4b1d78'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename tables
    op.rename_table('scorm_packages', 'learning_packages')
    op.rename_table('scorm_sessions', 'learning_sessions')
    op.rename_table('scorm_tracking', 'learning_tracking')

    # Add standard columns
    op.add_column('learning_packages', sa.Column('standard', sa.String(length=50), server_default='SCORM_1_2', nullable=False))
    op.add_column('learning_packages', sa.Column('standard_version', sa.String(length=50), server_default='1.2', nullable=False))
    
    # Rename foreign key columns
    op.alter_column('learning_sessions', 'scorm_package_id', new_column_name='package_id')
    op.alter_column('course_modules', 'scorm_package_id', new_column_name='learning_package_id')

    # Update foreign keys
    op.drop_constraint('scorm_sessions_scorm_package_id_fkey', 'learning_sessions', type_='foreignkey')
    op.create_foreign_key('learning_sessions_package_id_fkey', 'learning_sessions', 'learning_packages', ['package_id'], ['id'], ondelete='CASCADE')

    op.drop_constraint('scorm_tracking_session_id_fkey', 'learning_tracking', type_='foreignkey')
    op.create_foreign_key('learning_tracking_session_id_fkey', 'learning_tracking', 'learning_sessions', ['session_id'], ['id'], ondelete='CASCADE')

    op.drop_constraint('course_modules_scorm_package_id_fkey', 'course_modules', type_='foreignkey')
    op.create_foreign_key('course_modules_learning_package_id_fkey', 'course_modules', 'learning_packages', ['learning_package_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    op.drop_constraint('course_modules_learning_package_id_fkey', 'course_modules', type_='foreignkey')
    op.create_foreign_key('course_modules_scorm_package_id_fkey', 'course_modules', 'learning_packages', ['scorm_package_id'], ['id'], ondelete='SET NULL')
    
    op.drop_constraint('learning_tracking_session_id_fkey', 'learning_tracking', type_='foreignkey')
    op.create_foreign_key('scorm_tracking_session_id_fkey', 'learning_tracking', 'learning_sessions', ['session_id'], ['id'], ondelete='CASCADE')

    op.drop_constraint('learning_sessions_package_id_fkey', 'learning_sessions', type_='foreignkey')
    op.create_foreign_key('scorm_sessions_scorm_package_id_fkey', 'learning_sessions', 'learning_packages', ['scorm_package_id'], ['id'], ondelete='CASCADE')

    op.alter_column('course_modules', 'learning_package_id', new_column_name='scorm_package_id')
    op.alter_column('learning_sessions', 'package_id', new_column_name='scorm_package_id')

    op.drop_column('learning_packages', 'standard_version')
    op.drop_column('learning_packages', 'standard')

    op.rename_table('learning_tracking', 'scorm_tracking')
    op.rename_table('learning_sessions', 'scorm_sessions')
    op.rename_table('learning_packages', 'scorm_packages')
