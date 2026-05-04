import { HiOutlineUserMinus, HiOutlineUserPlus } from 'react-icons/hi2'

import Button from '../common/Button'
import InputField from '../common/InputField'
import Panel from '../common/Panel'
import { getInitials } from '../../utils/format'

function MemberManager({
  addingMember,
  canManage,
  creatorId,
  memberQuery,
  members = [],
  onAddMember,
  onMemberQueryChange,
  onRemoveMember,
  searchResults = [],
}) {
  const handleSubmit = async (event) => {
    event.preventDefault()
    await onAddMember()
  }

  return (
    <Panel>
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="eyebrow">Team Members</p>
          <h3 className="font-display text-2xl font-semibold text-slate-50">Project roster</h3>
          <p className="text-sm text-slate-400">
            {canManage
              ? 'Add teammates by email and manage who participates in this workspace.'
              : 'Current project members and their role access.'}
          </p>
        </div>

        {canManage ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <InputField
              label="Invite by email"
              placeholder="teammate@company.com"
              value={memberQuery}
              onChange={(event) => onMemberQueryChange(event.target.value)}
            />

            {searchResults.length ? (
              <div className="space-y-2 rounded-2xl border border-white/8 bg-white/5 p-3">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => onMemberQueryChange(user.email)}
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">Use</span>
                  </button>
                ))}
              </div>
            ) : null}

            <Button type="submit" className="gap-2" loading={addingMember}>
              <HiOutlineUserPlus />
              Add member
            </Button>
          </form>
        ) : null}

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.user._id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 font-display text-sm font-semibold text-cyan-100">
                  {getInitials(member.user.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{member.user.name}</p>
                  <p className="text-xs text-slate-400">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {member.role}
                </span>

                {canManage && member.user._id !== creatorId ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => onRemoveMember(member.user)}
                  >
                    <HiOutlineUserMinus />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

export default MemberManager
