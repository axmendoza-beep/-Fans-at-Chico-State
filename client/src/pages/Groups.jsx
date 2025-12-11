import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI, groupMembershipsAPI, groupMessagesAPI, profilesAPI, groupPollsAPI, groupPollVotesAPI } from '../lib/api';

function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]); // all groups
  const [memberships, setMemberships] = useState([]); // memberships for current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    sport: '',
    description: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessageBody, setNewMessageBody] = useState('');
  const [profilesById, setProfilesById] = useState({});
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '', '']);
  const [pollClosesAt, setPollClosesAt] = useState('');
  const [polls, setPolls] = useState([]);
  const [pollVotes, setPollVotes] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [showPastPolls, setShowPastPolls] = useState(false);

  useEffect(() => {
    fetchGroupsAndMemberships();
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profilesAPI.getAll();
        const byId = {};
        (res.data || []).forEach((p) => {
          if (p.user_id) byId[p.user_id] = p;
        });
        setProfilesById(byId);
      } catch (err) {
        console.error('Failed to load profiles for group chat', err);
      }
    };

    fetchProfiles();
  }, []);

  const fetchGroupsAndMemberships = async () => {
    try {
      setLoading(true);
      let user = null;
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          user = JSON.parse(stored);
        } catch {
          user = null;
        }
      }

      if (!user || !user.user_id) {
        navigate('/login');
        return;
      }

      const [groupsRes, membershipsRes] = await Promise.all([
        groupsAPI.getAll(),
        groupMembershipsAPI.getAll(),
      ]);

      setGroups(groupsRes.data || []);

      const userMemberships = (membershipsRes.data || []).filter(
        (m) => m.user_id === user.user_id,
      );
      setMemberships(userMemberships);
      setCurrentUser(user);

      if (userMemberships.length > 0 && !selectedGroupId) {
        setSelectedGroupId(userMemberships[0].group_id);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load groups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await groupsAPI.create(newGroup);
      const createdGroup = res?.data || res;

      // Automatically add the creator as a member (owner) of the new group
      if (createdGroup && createdGroup.group_id && currentUser && currentUser.user_id) {
        try {
          await groupMembershipsAPI.create({
            group_id: createdGroup.group_id,
            user_id: currentUser.user_id,
            role: 'owner',
          });
        } catch (membershipErr) {
          console.error('Failed to create membership for new group', membershipErr);
        }
      }

      alert('Group created successfully!');
      setShowCreateForm(false);
      setNewGroup({
        name: '',
        sport: '',
        description: ''
      });
      fetchGroupsAndMemberships();
    } catch (err) {
      alert('Failed to create group: ' + err.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!currentUser || !currentUser.user_id) {
      navigate('/login');
      return;
    }

    const membership = memberships.find(
      (m) => m.group_id === groupId && m.user_id === currentUser.user_id,
    );
    if (!membership) {
      return;
    }

    const confirmed = window.confirm('Leave this group?');
    if (!confirmed) return;

    try {
      await groupMembershipsAPI.delete(membership.membership_id);
      const nextMemberships = memberships.filter((m) => m.membership_id !== membership.membership_id);
      setMemberships(nextMemberships);

      const joinedIds = new Set(nextMemberships.map((m) => m.group_id));
      if (!joinedIds.has(selectedGroupId)) {
        const nextId = nextMemberships.length > 0 ? nextMemberships[0].group_id : null;
        setSelectedGroupId(nextId);
        setMessages([]);
      }
    } catch (err) {
      alert('Failed to leave group: ' + err.message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId || !currentUser || !currentUser.user_id) {
      navigate('/login');
      return;
    }

    const membership = memberships.find(
      (m) => m.group_id === selectedGroupId && m.user_id === currentUser.user_id,
    );

    if (!membership || membership.role !== 'owner') {
      return;
    }

    const confirmed = window.confirm('Delete this group for all members? This cannot be undone.');
    if (!confirmed) return;

    try {
      await groupsAPI.delete(selectedGroupId);

      const nextGroups = groups.filter((g) => g.group_id !== selectedGroupId);
      const nextMemberships = memberships.filter((m) => m.group_id !== selectedGroupId);

      setGroups(nextGroups);
      setMemberships(nextMemberships);

      const nextJoinedIds = new Set(nextMemberships.map((m) => m.group_id));
      const nextSelectedId = nextJoinedIds.size > 0 ? Array.from(nextJoinedIds)[0] : null;

      setSelectedGroupId(nextSelectedId);
      if (!nextSelectedId) {
        setMessages([]);
        setPolls([]);
        setPollVotes([]);
      }
    } catch (err) {
      alert('Failed to delete group: ' + err.message);
    }
  };

  const loadMessagesForGroup = async (groupId) => {
    if (!groupId) {
      setMessages([]);
      return;
    }

    try {
      setMessagesLoading(true);
      const res = await groupMessagesAPI.getAll();
      const allMessages = res.data || [];
      const groupMessages = allMessages
        .filter((m) => m.group_id === groupId)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(groupMessages);
    } catch (err) {
      console.error('Failed to load group messages', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      loadMessagesForGroup(selectedGroupId);
    } else {
      setMessages([]);
    }
  }, [selectedGroupId]);

  const loadPollsForGroup = async (groupId) => {
    if (!groupId) {
      setPolls([]);
      setPollVotes([]);
      return;
    }

    try {
      setPollsLoading(true);
      const [pollsRes, votesRes] = await Promise.all([
        groupPollsAPI.getAll(),
        groupPollVotesAPI.getAll(),
      ]);

      const allPolls = pollsRes.data || [];
      const allVotes = votesRes.data || [];

      const groupPolls = allPolls.filter((p) => p.group_id === groupId);
      const groupVotes = allVotes.filter((v) =>
        groupPolls.some((p) => p.poll_id === v.poll_id),
      );

      setPolls(groupPolls);
      setPollVotes(groupVotes);
    } catch (err) {
      console.error('Failed to load group polls or votes', err);
    } finally {
      setPollsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      loadPollsForGroup(selectedGroupId);
    } else {
      setPolls([]);
      setPollVotes([]);
    }
  }, [selectedGroupId]);

  // Note: we intentionally do NOT poll messages/polls on an interval.
  // Messages and polls are loaded when the selected group changes and
  // after actions like sending a message or creating a poll. This avoids
  // flicker where messages briefly disappear or reload every few seconds.

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageBody.trim() || !selectedGroupId || !currentUser) return;

    try {
      const res = await groupMessagesAPI.create({
        group_id: selectedGroupId,
        user_id: currentUser.user_id,
        body: newMessageBody.trim(),
      });
      const created = res.data || null;
      if (created) {
        setMessages((prev) => [...prev, created]);
      } else {
        // Fallback: reload
        loadMessagesForGroup(selectedGroupId);
      }
      setNewMessageBody('');
      // Refresh to pick up any messages that arrived during send
      loadMessagesForGroup(selectedGroupId);
      loadPollsForGroup(selectedGroupId);
    } catch (err) {
      console.error('Failed to send group message', err);
      if (err && err.response) {
        console.error('Backend response for group message error:', err.response.data);
      }
      alert('Failed to send message: ' + err.message);
    }
  };

  const handlePinMessage = async (message) => {
    if (!currentUser || !selectedGroupId) return;

    const membership = memberships.find(
      (m) => m.group_id === selectedGroupId && m.user_id === currentUser.user_id,
    );
    const isOwner = membership && membership.role === 'owner';
    const isAuthor = message.user_id === currentUser.user_id;

    if (!isOwner && !isAuthor) return;

    try {
      await groupMessagesAPI.update(message.message_id, {
        is_pinned: true,
        pinned_by_user_id: currentUser.user_id,
        pinned_at: new Date().toISOString(),
      });
      loadMessagesForGroup(selectedGroupId);
    } catch (err) {
      alert('Failed to pin message: ' + err.message);
    }
  };

  const handleUnpinMessage = async (message) => {
    if (!currentUser || !selectedGroupId) return;

    const membership = memberships.find(
      (m) => m.group_id === selectedGroupId && m.user_id === currentUser.user_id,
    );
    const isOwner = membership && membership.role === 'owner';
    const isAuthor = message.user_id === currentUser.user_id;

    if (!isOwner && !isAuthor) return;

    try {
      await groupMessagesAPI.update(message.message_id, {
        is_pinned: false,
        pinned_by_user_id: null,
        pinned_at: null,
      });
      loadMessagesForGroup(selectedGroupId);
    } catch (err) {
      alert('Failed to unpin message: ' + err.message);
    }
  };

  const handleVoteOnPoll = async (pollId, optionValue) => {
    if (!currentUser || !selectedGroupId) return;

    const hasVoted = pollVotes.some(
      (v) => v.poll_id === pollId && v.user_id === currentUser.user_id,
    );
    if (hasVoted) return;

    try {
      const res = await groupPollVotesAPI.create({
        poll_id: pollId,
        user_id: currentUser.user_id,
        selected_option: optionValue,
      });
      const created = res.data || null;
      if (created) {
        setPollVotes((prev) => [...prev, created]);
      } else {
        loadPollsForGroup(selectedGroupId);
      }
    } catch (err) {
      alert('Failed to submit vote: ' + err.message);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !currentUser) return;

    const trimmedQuestion = pollQuestion.trim();
    const options = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);

    if (!trimmedQuestion) {
      alert('Please enter a question for the poll.');
      return;
    }
    if (options.length < 2) {
      alert('Please provide at least two options for the poll.');
      return;
    }
    if (options.length > 5) {
      alert('You can only have up to 5 options.');
      return;
    }

    try {
      const closesAtIso = pollClosesAt
        ? new Date(pollClosesAt).toISOString()
        : null;

      const payload = {
        group_id: selectedGroupId,
        author_user_id: currentUser.user_id,
        question: trimmedQuestion,
        options_text: JSON.stringify(options),
        closes_at: closesAtIso,
      };

      await groupPollsAPI.create(payload);
      alert('Poll created successfully!');
      setShowPollForm(false);
      setPollQuestion('');
      setPollOptions(['', '', '', '', '']);
      setPollClosesAt('');
      // Immediately reload polls so the new one appears as the current poll
      loadPollsForGroup(selectedGroupId);
    } catch (err) {
      alert('Failed to create poll: ' + err.message);
    }
  };

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div style={{ color: '#b71c1c' }}>{error}</div>;

  const joinedGroupIds = new Set(memberships.map((m) => m.group_id));
  const joinedGroups = groups.filter((g) => joinedGroupIds.has(g.group_id));
  const selectedGroup = joinedGroups.find((g) => g.group_id === selectedGroupId) || null;

  const selectedMembership = memberships.find(
    (m) => m.group_id === selectedGroupId && currentUser && m.user_id === currentUser.user_id,
  );
  const isGroupOwner = !!selectedMembership && selectedMembership.role === 'owner';

  const now = new Date();
  const activePolls = polls.filter((p) => {
    if (!p.closes_at) return true;
    const closes = new Date(p.closes_at);
    return closes > now;
  });
  const closedPolls = polls.filter((p) => {
    if (!p.closes_at) return false;
    const closes = new Date(p.closes_at);
    return closes <= now;
  });

  // Treat the most recent active poll as the "current" poll to pin at the top of chat
  const currentPoll =
    activePolls
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;

  return (
    <div style={{ background: '#fdf7f7', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          border: '1px solid #f2d6d6',
        }}
      >
        <h1>Fan Groups</h1>
        <p>Join groups, chat with fans, and stay connected</p>

        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create New Group'}
        </button>

        {showCreateForm && (
          <div
            style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}
          >
            <h2>Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Group Name:</label><br />
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Sport:</label><br />
                <input
                  type="text"
                  value={newGroup.sport}
                  onChange={(e) => setNewGroup({ ...newGroup, sport: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Description:</label><br />
                <textarea
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                />
              </div>
              <button type="submit">Create Group</button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem' }}>
          {/* Left column: joined groups */}
          <div style={{ flexBasis: '30%', maxWidth: '320px' }}>
            <h2>Your Fan Groups ({joinedGroups.length})</h2>
            {joinedGroups.length === 0 ? (
              <p>You're not in any Fan Groups yet.</p>
            ) : (
              <div>
                {joinedGroups.map((group) => {
                  const isSelected = group.group_id === selectedGroupId;
                  return (
                    <div
                      key={group.group_id}
                      onClick={() => setSelectedGroupId(group.group_id)}
                      style={{
                        border: '1px solid #f2d6d6',
                        padding: '0.75rem 1rem',
                        marginBottom: '0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
                        boxShadow: isSelected ? '0 2px 4px rgba(153,0,0,0.08)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem' }}>{group.name}</h3>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#555' }}>
                            <strong>Sport:</strong> {group.sport}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveGroup(group.group_id);
                          }}
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #c62828',
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Leave
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column: chat + polls */}
          <div style={{ flex: 1 }}>
            <h2>Group Chat</h2>
            {!selectedGroup ? (
              <p>Select a group from your list to view its chat.</p>
            ) : (
              <div
                style={{
                  border: '1px solid #f2d6d6',
                  borderRadius: '6px',
                  padding: '1rem',
                  minHeight: '300px',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(153,0,0,0.06)',
                }}
              >
                {/* Header with group name and delete button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <h3 style={{ marginTop: 0 }}>{selectedGroup.name}</h3>
                    <p
                      style={{
                        marginTop: 0,
                        fontSize: '0.9rem',
                        color: '#555',
                      }}
                    >
                      {selectedGroup.description || 'No description yet.'}
                    </p>
                  </div>
                  {isGroupOwner && (
                    <button
                      type="button"
                      onClick={handleDeleteGroup}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        border: '1px solid #b71c1c',
                        backgroundColor: '#ffebee',
                        color: '#b71c1c',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        height: 'fit-content',
                      }}
                    >
                      Delete Group
                    </button>
                  )}
                </div>

                {/* Poll create toggle */}
                <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPollForm((prev) => !prev)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.85rem',
                      borderRadius: '4px',
                      border: '1px solid #990000',
                      backgroundColor: '#fff5f5',
                      cursor: 'pointer',
                    }}
                  >
                    {showPollForm ? 'Cancel Poll' : 'Create Poll'}
                  </button>
                </div>

                {/* Poll form */}
                {showPollForm && (
                  <div
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>New Poll</h4>
                    <form onSubmit={handleCreatePoll}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.25rem',
                            fontWeight: 'bold',
                          }}
                        >
                          Question
                        </label>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="What are you voting on?"
                          style={{ width: '100%', padding: '0.5rem' }}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.25rem',
                            fontWeight: 'bold',
                          }}
                        >
                          Options (up to 5)
                        </label>
                        {pollOptions.map((opt, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const next = [...pollOptions];
                              next[idx] = e.target.value;
                              setPollOptions(next);
                            }}
                            placeholder={`Option ${idx + 1}`}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              marginBottom: '0.25rem',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.25rem',
                            fontWeight: 'bold',
                          }}
                        >
                          Keep poll open until
                        </label>
                        <input
                          type="datetime-local"
                          value={pollClosesAt}
                          onChange={(e) => setPollClosesAt(e.target.value)}
                          style={{ padding: '0.5rem' }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                      >
                        Create Poll
                      </button>
                    </form>
                  </div>
                )}

                {/* Current poll */}
                <div style={{ marginBottom: '1rem' }}>
                  {pollsLoading ? (
                    <p>Loading polls...</p>
                  ) : !currentPoll ? null : (
                    <div>
                      {(() => {
                        const poll = currentPoll;
                        const options = (() => {
                          try {
                            const parsed = JSON.parse(poll.options_text || '[]');
                            return Array.isArray(parsed) ? parsed : [];
                          } catch {
                            return [];
                          }
                        })();

                        const votesForPoll = pollVotes.filter(
                          (v) => v.poll_id === poll.poll_id,
                        );
                        const totalVotes = votesForPoll.length;
                        const userVote = currentUser
                          ? votesForPoll.find(
                              (v) => v.user_id === currentUser.user_id,
                            ) || null
                          : null;
                        const isClosed =
                          poll.closes_at && new Date(poll.closes_at) <= now;

                        let winningOptions = new Set();
                        if (totalVotes > 0) {
                          let maxCount = 0;
                          options.forEach((opt) => {
                            const count = votesForPoll.filter(
                              (v) => v.selected_option === opt,
                            ).length;
                            if (count > maxCount) {
                              maxCount = count;
                            }
                          });
                          options.forEach((opt) => {
                            const count = votesForPoll.filter(
                              (v) => v.selected_option === opt,
                            ).length;
                            if (count === maxCount && maxCount > 0) {
                              winningOptions.add(opt);
                            }
                          });
                        }

                        return (
                          <div
                            key={poll.poll_id}
                            style={{
                              border: '1px solid #eee',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              marginBottom: '0.75rem',
                              backgroundColor: '#f9f9f9',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ fontWeight: 'bold' }}>{poll.question}</div>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                {isClosed
                                  ? 'Poll closed'
                                  : poll.closes_at
                                  ? `Closes: ${new Date(
                                      poll.closes_at,
                                    ).toLocaleString()}`
                                  : 'Open poll'}
                              </div>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                              {options.map((opt) => {
                                const count = votesForPoll.filter(
                                  (v) => v.selected_option === opt,
                                ).length;
                                const pct =
                                  totalVotes > 0
                                    ? Math.round((count / totalVotes) * 100)
                                    : 0;
                                const disabled = isClosed || !!userVote;
                                const isWinner =
                                  isClosed && winningOptions.has(opt);

                                return (
                                  <div
                                    key={opt}
                                    style={{ marginBottom: '0.35rem' }}
                                  >
                                    <button
                                      type="button"
                                      disabled={disabled}
                                      onClick={() =>
                                        handleVoteOnPoll(poll.poll_id, opt)
                                      }
                                      style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.35rem 0.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        backgroundColor:
                                          disabled &&
                                          userVote?.selected_option === opt
                                            ? '#e3f2fd'
                                            : '#ffffff',
                                        cursor: disabled ? 'default' : 'pointer',
                                        fontSize: '0.85rem',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontWeight: isWinner
                                              ? 'bold'
                                              : 'normal',
                                          }}
                                        >
                                          {opt}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '0.8rem',
                                            color: '#555',
                                          }}
                                        >
                                          {count} vote{count !== 1 ? 's' : ''} (
                                          {pct}%)
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          marginTop: '0.25rem',
                                          height: '6px',
                                          borderRadius: '3px',
                                          backgroundColor: '#eee',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: `${pct}%`,
                                            height: '100%',
                                            borderRadius: '3px',
                                            backgroundColor: isWinner
                                              ? '#2e7d32'
                                              : '#1976d2',
                                          }}
                                        />
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                              <div
                                style={{
                                  marginTop: '0.25rem',
                                  fontSize: '0.75rem',
                                  color: '#777',
                                }}
                              >
                                Total votes: {totalVotes}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Past polls */}
                {closedPolls.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowPastPolls((prev) => !prev)}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      {showPastPolls
                        ? `Hide Past Polls (${closedPolls.length})`
                        : `Show Past Polls (${closedPolls.length})`}
                    </button>
                    {showPastPolls && (
                      <div style={{ marginTop: '0.75rem' }}>
                        {closedPolls.map((poll) => {
                          const options = (() => {
                            try {
                              const parsed = JSON.parse(poll.options_text || '[]');
                              return Array.isArray(parsed) ? parsed : [];
                            } catch {
                              return [];
                            }
                          })();

                          const votesForPoll = pollVotes.filter(
                            (v) => v.poll_id === poll.poll_id,
                          );
                          const totalVotes = votesForPoll.length;

                          let winningOptions = new Set();
                          if (totalVotes > 0) {
                            let maxCount = 0;
                            options.forEach((opt) => {
                              const count = votesForPoll.filter(
                                (v) => v.selected_option === opt,
                              ).length;
                              if (count > maxCount) {
                                maxCount = count;
                              }
                            });
                            options.forEach((opt) => {
                              const count = votesForPoll.filter(
                                (v) => v.selected_option === opt,
                              ).length;
                              if (count === maxCount && maxCount > 0) {
                                winningOptions.add(opt);
                              }
                            });
                          }

                          return (
                            <div
                              key={poll.poll_id}
                              style={{
                                border: '1px solid #eee',
                                borderRadius: '4px',
                                padding: '0.75rem',
                                marginBottom: '0.75rem',
                                backgroundColor: '#fafafa',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <div style={{ fontWeight: 'bold' }}>
                                  {poll.question}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  Closed:{' '}
                                  {poll.closes_at
                                    ? new Date(
                                        poll.closes_at,
                                      ).toLocaleString()
                                    : 'Unknown'}
                                </div>
                              </div>
                              <div style={{ marginTop: '0.5rem' }}>
                                {options.map((opt) => {
                                  const count = votesForPoll.filter(
                                    (v) => v.selected_option === opt,
                                  ).length;
                                  const pct =
                                    totalVotes > 0
                                      ? Math.round((count / totalVotes) * 100)
                                      : 0;
                                  const isWinner = winningOptions.has(opt);

                                  return (
                                    <div
                                      key={opt}
                                      style={{ marginBottom: '0.35rem' }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          fontSize: '0.85rem',
                                        }}
                                      >
                                        <span
                                          style={{
                                            fontWeight: isWinner
                                              ? 'bold'
                                              : 'normal',
                                          }}
                                        >
                                          {opt}
                                        </span>
                                        <span
                                          style={{
                                            fontSize: '0.8rem',
                                            color: '#555',
                                          }}
                                        >
                                          {count} vote{count !== 1 ? 's' : ''} (
                                          {pct}%)
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          marginTop: '0.25rem',
                                          height: '6px',
                                          borderRadius: '3px',
                                          backgroundColor: '#eee',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: `${pct}%`,
                                            height: '100%',
                                            borderRadius: '3px',
                                            backgroundColor: '#1976d2',
                                          }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                                <div
                                  style={{
                                    marginTop: '0.25rem',
                                    fontSize: '0.75rem',
                                    color: '#777',
                                  }}
                                >
                                  Total votes: {totalVotes}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages list with pinned section */}
                {(() => {
                  const pinnedMessages = messages
                    .filter((m) => m.is_pinned)
                    .sort(
                      (a, b) =>
                        new Date(b.pinned_at || b.created_at) -
                        new Date(a.pinned_at || a.created_at),
                    );
                  const regularMessages = messages
                    .filter((m) => !m.is_pinned)
                    .sort(
                      (a, b) =>
                        new Date(a.created_at) - new Date(b.created_at),
                    );

                  const renderMessage = (msg, { showPinnedBadge }) => {
                    const canPinOrUnpin =
                      (currentUser && msg.user_id === currentUser.user_id) ||
                      isGroupOwner;
                    return (
                      <div
                        key={msg.message_id}
                        style={{ marginTop: '0.75rem' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          {profilesById[msg.user_id]?.profile_photo_url && (
                            <img
                              src={profilesById[msg.user_id].profile_photo_url}
                              alt="avatar"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                              }}
                            >
                              <strong style={{ fontSize: '0.9rem' }}>
                                {profilesById[msg.user_id]?.display_name ||
                                  'Unknown User'}
                              </strong>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#777',
                                }}
                              >
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            {showPinnedBadge && (
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginTop: '0.15rem',
                                  marginBottom: '0.15rem',
                                  padding: '0.1rem 0.4rem',
                                  fontSize: '0.7rem',
                                  borderRadius: '999px',
                                  backgroundColor: '#fff3cd',
                                  color: '#856404',
                                  border: '1px solid #ffeeba',
                                }}
                              >
                                Pinned
                              </span>
                            )}
                            <p
                              style={{
                                margin: '0.25rem 0',
                                fontSize: '0.9rem',
                              }}
                            >
                              {msg.body}
                            </p>
                          </div>
                        </div>
                        {canPinOrUnpin && (
                          <div
                            style={{
                              marginLeft: '2.25rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            {msg.is_pinned ? (
                              <button
                                type="button"
                                onClick={() => handleUnpinMessage(msg)}
                                style={{
                                  padding: '0.15rem 0.4rem',
                                  fontSize: '0.7rem',
                                  borderRadius: '4px',
                                  border: '1px solid #c62828',
                                  backgroundColor: '#ffebee',
                                  color: '#c62828',
                                  cursor: 'pointer',
                                }}
                              >
                                Unpin
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePinMessage(msg)}
                                style={{
                                  padding: '0.15rem 0.4rem',
                                  fontSize: '0.7rem',
                                  borderRadius: '4px',
                                  border: '1px solid #1976d2',
                                  backgroundColor: '#e3f2fd',
                                  color: '#1976d2',
                                  cursor: 'pointer',
                                }}
                              >
                                Pin
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <>
                      {pinnedMessages.length > 0 && (
                        <div
                          style={{
                            marginTop: '1rem',
                            paddingBottom: '0.5rem',
                            marginBottom: '0.75rem',
                            borderTop: '1px solid #eee',
                            borderBottom: '1px dashed #ddd',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              color: '#555',
                            }}
                          >
                            Pinned announcements
                          </div>
                          {pinnedMessages.map((msg) =>
                            renderMessage(msg, { showPinnedBadge: true }),
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          maxHeight: '300px',
                          overflowY: 'auto',
                          paddingRight: '0.5rem',
                          borderTop:
                            pinnedMessages.length === 0
                              ? '1px solid #eee'
                              : 'none',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        {messagesLoading ? (
                          <p>Loading messages...</p>
                        ) : regularMessages.length === 0 ? (
                          <p>No messages yet. Start the conversation!</p>
                        ) : (
                          <div>
                            {regularMessages.map((msg) =>
                              renderMessage(msg, { showPinnedBadge: false }),
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Message input */}
                <form
                  onSubmit={handleSendMessage}
                  style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}
                >
                  <input
                    type="text"
                    value={newMessageBody}
                    onChange={(e) => setNewMessageBody(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '0.5rem' }}
                  />
                  <button
                    type="submit"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;
