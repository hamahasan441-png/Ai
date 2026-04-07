import { describe, it, expect } from 'vitest'
import { getDestructiveCommandWarning } from '../destructiveCommandWarning.js'

describe('getDestructiveCommandWarning', () => {
  describe('git data-loss commands', () => {
    it('warns on git reset --hard', () => {
      expect(getDestructiveCommandWarning('git reset --hard')).toBe(
        'Note: may discard uncommitted changes',
      )
    })

    it('warns on git reset --hard HEAD~1', () => {
      expect(getDestructiveCommandWarning('git reset --hard HEAD~1')).toBe(
        'Note: may discard uncommitted changes',
      )
    })

    it('warns on git push --force', () => {
      expect(getDestructiveCommandWarning('git push --force')).toBe(
        'Note: may overwrite remote history',
      )
    })

    it('warns on git push -f', () => {
      expect(getDestructiveCommandWarning('git push origin main -f')).toBe(
        'Note: may overwrite remote history',
      )
    })

    it('warns on git push --force-with-lease', () => {
      expect(getDestructiveCommandWarning('git push --force-with-lease')).toBe(
        'Note: may overwrite remote history',
      )
    })

    it('warns on git clean -f', () => {
      expect(getDestructiveCommandWarning('git clean -f')).toBe(
        'Note: may permanently delete untracked files',
      )
    })

    it('warns on git clean -fd', () => {
      expect(getDestructiveCommandWarning('git clean -fd')).toBe(
        'Note: may permanently delete untracked files',
      )
    })

    it('does not warn on git clean --dry-run', () => {
      expect(getDestructiveCommandWarning('git clean --dry-run -f')).toBeNull()
    })

    it('does not warn on git clean -n', () => {
      expect(getDestructiveCommandWarning('git clean -nf')).toBeNull()
    })

    it('warns on git checkout .', () => {
      expect(getDestructiveCommandWarning('git checkout .')).toBe(
        'Note: may discard all working tree changes',
      )
    })

    it('warns on git restore .', () => {
      expect(getDestructiveCommandWarning('git restore .')).toBe(
        'Note: may discard all working tree changes',
      )
    })

    it('warns on git stash drop', () => {
      expect(getDestructiveCommandWarning('git stash drop')).toBe(
        'Note: may permanently remove stashed changes',
      )
    })

    it('warns on git stash clear', () => {
      expect(getDestructiveCommandWarning('git stash clear')).toBe(
        'Note: may permanently remove stashed changes',
      )
    })

    it('warns on git branch -D', () => {
      expect(getDestructiveCommandWarning('git branch -D feature')).toBe(
        'Note: may force-delete a branch',
      )
    })
  })

  describe('git safety bypass commands', () => {
    it('warns on git commit --no-verify', () => {
      expect(getDestructiveCommandWarning('git commit --no-verify -m "msg"')).toBe(
        'Note: may skip safety hooks',
      )
    })

    it('warns on git push --no-verify', () => {
      expect(getDestructiveCommandWarning('git push --no-verify')).toBe(
        'Note: may skip safety hooks',
      )
    })

    it('warns on git commit --amend', () => {
      expect(getDestructiveCommandWarning('git commit --amend')).toBe(
        'Note: may rewrite the last commit',
      )
    })
  })

  describe('file deletion commands', () => {
    it('warns on rm -rf', () => {
      const result = getDestructiveCommandWarning('rm -rf /some/path')
      expect(result).toBe('Note: may recursively force-remove files')
    })

    it('warns on rm -r', () => {
      const result = getDestructiveCommandWarning('rm -r dir/')
      expect(result).toBe('Note: may recursively remove files')
    })

    it('warns on rm -f', () => {
      const result = getDestructiveCommandWarning('rm -f file.txt')
      expect(result).toBe('Note: may force-remove files')
    })

    it('warns on rm -fr (reversed flags)', () => {
      const result = getDestructiveCommandWarning('rm -fr dir/')
      expect(result).toBe('Note: may recursively force-remove files')
    })
  })

  describe('database commands', () => {
    it('warns on DROP TABLE', () => {
      expect(getDestructiveCommandWarning('DROP TABLE users')).toBe(
        'Note: may drop or truncate database objects',
      )
    })

    it('warns on TRUNCATE TABLE (case insensitive)', () => {
      expect(getDestructiveCommandWarning('truncate table logs')).toBe(
        'Note: may drop or truncate database objects',
      )
    })

    it('warns on DROP DATABASE', () => {
      expect(getDestructiveCommandWarning('DROP DATABASE mydb')).toBe(
        'Note: may drop or truncate database objects',
      )
    })

    it('warns on DELETE FROM table;', () => {
      expect(getDestructiveCommandWarning('DELETE FROM users;')).toBe(
        'Note: may delete all rows from a database table',
      )
    })
  })

  describe('infrastructure commands', () => {
    it('warns on kubectl delete', () => {
      expect(getDestructiveCommandWarning('kubectl delete pod my-pod')).toBe(
        'Note: may delete Kubernetes resources',
      )
    })

    it('warns on terraform destroy', () => {
      expect(getDestructiveCommandWarning('terraform destroy')).toBe(
        'Note: may destroy Terraform infrastructure',
      )
    })
  })

  describe('safe commands', () => {
    it('returns null for ls', () => {
      expect(getDestructiveCommandWarning('ls -la')).toBeNull()
    })

    it('returns null for cat', () => {
      expect(getDestructiveCommandWarning('cat file.txt')).toBeNull()
    })

    it('returns null for git status', () => {
      expect(getDestructiveCommandWarning('git status')).toBeNull()
    })

    it('returns null for git commit (without --amend)', () => {
      expect(getDestructiveCommandWarning('git commit -m "update"')).toBeNull()
    })

    it('returns null for git push (without --force)', () => {
      expect(getDestructiveCommandWarning('git push origin main')).toBeNull()
    })

    it('returns null for echo', () => {
      expect(getDestructiveCommandWarning('echo "hello world"')).toBeNull()
    })

    it('returns null for mkdir', () => {
      expect(getDestructiveCommandWarning('mkdir -p new_dir')).toBeNull()
    })

    it('returns null for npm install', () => {
      expect(getDestructiveCommandWarning('npm install express')).toBeNull()
    })
  })
})
