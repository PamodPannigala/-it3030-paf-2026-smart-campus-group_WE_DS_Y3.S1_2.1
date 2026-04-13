import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [replyToComment, setReplyToComment] = useState(null);

  const commentFormRef = useRef(null);
  const commentNodeRefs = useRef({});

  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole") || "USER";

  useEffect(() => {
    fetchAll();
  }, [ticketId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [ticketRes, commentRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/tickets/${ticketId}`),
        axios.get(`${BACKEND_URL}/api/tickets/${ticketId}/comments`),
      ]);
      setTicket(ticketRes.data);
      setComments(commentRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED ADD COMMENT
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const formData = new FormData();
      formData.append("author", userEmail);
      formData.append("message", newComment);
      formData.append("authorRole", userRole.toUpperCase());

      if (replyToComment?.id) {
        formData.append("parentId", replyToComment.id);
      }

      const res = await axios.post(
        `${BACKEND_URL}/api/tickets/${ticketId}/comments`,
        formData
      );

      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
      setShowCommentForm(false);
      setReplyToComment(null);
    } catch (err) {
      console.error("Add comment failed:", err.response?.data || err);
    }
  };

  // ✅ FIXED EDIT COMMENT
  const handleEditComment = async (commentId) => {
    if (!editingMessage.trim()) return;

    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/tickets/${ticketId}/comments/${commentId}?author=${userEmail}&authorRole=${userRole.toUpperCase()}`,
        { message: editingMessage }
      );

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? res.data : c))
      );

      setEditingId(null);
      setEditingMessage("");
    } catch (err) {
      console.error("Edit failed:", err.response?.data || err);
    }
  };

  // ✅ FIXED DELETE COMMENT
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${BACKEND_URL}/api/tickets/${ticketId}/comments/${commentId}?author=${userEmail}&authorRole=${userRole.toUpperCase()}`
      );

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Just now";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStageState = (status) => {
    const normalized = (status || "").toUpperCase();
    return {
      open: true,
      inProgress: ["IN_PROGRESS", "IN PROGRESS", "RESOLVED", "CLOSED"].includes(normalized),
      resolved: ["RESOLVED", "CLOSED"].includes(normalized),
      closed: normalized === "CLOSED",
    };
  };

  const buildCommentTree = (comments = []) => {
    const sorted = [...comments].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    const map = new Map();
    sorted.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] });
    });

    const roots = [];

    sorted.forEach((comment) => {
      const node = map.get(comment.id);

      if (comment.parentCommentId && map.has(comment.parentCommentId)) {
        map.get(comment.parentCommentId).replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderCommentNode = (comment, level = 0) => {
    const canModify =
      comment.author === userEmail ||
      userRole.toUpperCase() === "ADMIN";

    return (
      <div
        key={comment.id}
        ref={(el) => {
          if (el) commentNodeRefs.current[comment.id] = el;
        }}
        style={{
          marginLeft: level > 0 ? `${Math.min(level * 28, 84)}px` : "0px",
          borderLeft: level > 0 ? "3px solid #e5e7eb" : "none",
          paddingLeft: level > 0 ? "14px" : "0px",
          marginTop: level > 0 ? "14px" : "0px",
        }}
      >
        <div className="comment-item">
          <div className="comment-line"></div>

          <div className="comment-body">
            <div className="comment-top">
              <span className="comment-author">{comment.author}</span>
              <span style={{ color: "#9ca3af" }}>•</span>
              <span className="comment-time">{formatDate(comment.createdAt)}</span>
            </div>

            {editingId === comment.id ? (
              <>
                <textarea
                  className="edit-comment-textarea"
                  value={editingMessage}
                  onChange={(e) => setEditingMessage(e.target.value)}
                />

                <div className="comment-actions">
                  <button
                    className="save-comment-btn"
                    onClick={() => handleEditComment(comment.id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-edit-btn"
                    onClick={() => {
                      setEditingId(null);
                      setEditingMessage("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="comment-text">{comment.message}</div>

                <div className="comment-actions">
                  <button
                    className="edit-comment-btn"
                    onClick={() => {
                      setReplyToComment(comment);
                      setShowCommentForm(true);
                      setTimeout(() => {
                        commentFormRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }, 100);
                    }}
                  >
                    Reply
                  </button>

                  {canModify && (
                    <>
                      <button
                        className="edit-comment-btn"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditingMessage(comment.message);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {comment.replies?.length > 0 && (
              <div>
                {comment.replies.map((reply) =>
                  renderCommentNode(reply, level + 1)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stageState = useMemo(() => getStageState(ticket?.status), [ticket]);

  if (loading) return <div style={{ padding: 30 }}>Loading ticket details...</div>;
  if (!ticket) return <div style={{ padding: 30 }}>Ticket not found.</div>;

  return (
    <>
      <style>{`
        .page-shell{max-width:1280px;margin:0 auto;padding:28px 24px 56px;background:#f6f7f8;min-height:100vh}
        .layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:28px;align-items:start}
        .card{background:#fff;border:1px solid #edeff1;border-radius:18px}
        .progress-card{padding:24px 28px;margin-bottom:18px}
        .progress-wrap{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .stage{display:flex;align-items:center;gap:10px}.dot{width:30px;height:30px;border-radius:999px;border:2px solid #cbd5e1;display:flex;align-items:center;justify-content:center}.dot.active{background:#2563eb;color:#fff;border-color:#2563eb}.connector{width:52px;height:3px;background:#dbeafe}
        .post-shell{padding:28px 30px 30px}.post-title{font-size:42px;font-weight:700;margin:16px 0}.status-chip{display:inline-flex;padding:7px 12px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700}
        .detail-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.image-tile{height:180px;overflow:hidden;border-radius:12px}.issue-image{width:100%;height:100%;object-fit:cover;cursor:zoom-in}
        .description{font-size:18px;line-height:1.9;color:#1f2937;white-space:pre-line}
        .summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:18px}.summary-item{background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:18px}
        .btn{border:none;border-radius:999px;padding:11px 18px;font-weight:700;cursor:pointer}.btn-primary{background:#2563eb;color:#fff}.btn-secondary{background:#e5e7eb}
        .side-panel{position:sticky;top:24px;padding:22px 20px}.quick-link{display:block;text-decoration:none;color:#111827;padding:14px 16px;border:1px solid #e5e7eb;border-radius:16px;margin-top:12px}
        .modal{display:flex;position:fixed;inset:0;background:rgba(15,23,42,.92);align-items:center;justify-content:center;padding:30px;z-index:9999}.modal img{max-width:92vw;max-height:88vh;border-radius:18px}
        .comment-form-wrap{margin-bottom:26px}
        .reply-banner{background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;border-radius:14px;padding:12px 14px;margin-bottom:12px;font-size:13px;line-height:1.6}
        .comment-entry-box{border:1px solid #d1d5db;border-radius:18px;background:#fff;overflow:hidden}
        .comment-entry-box textarea{width:100%;min-height:120px;border:none;outline:none;padding:18px}
        .comment-toolbar{display:flex;justify-content:flex-end;padding:14px 16px;border-top:1px solid #edeff1;background:#fafafa}
        .comment-toolbar-right{display:flex;gap:10px}
        .comments-list{display:flex;flex-direction:column;gap:22px}
        .comment-item{display:flex;gap:14px;align-items:flex-start}
        .comment-line{width:2px;background:#e5e7eb;border-radius:999px;align-self:stretch}
        .comment-body{flex:1}
        .comment-top{display:flex;gap:8px;margin-bottom:8px}
        .comment-author{font-weight:700}
        .comment-time{font-size:13px;color:#6b7280}
        .comment-text{line-height:1.8;margin-bottom:10px}
        .comment-actions{display:flex;gap:12px}
        .edit-comment-btn,.delete-comment-btn,.save-comment-btn,.cancel-edit-btn{border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:600}
        .edit-comment-btn:hover,.save-comment-btn:hover{color:#2563eb}
        .delete-comment-btn:hover{color:#ef4444}
        .edit-comment-textarea{width:100%;min-height:90px;border:1px solid #d1d5db;border-radius:12px;padding:12px;margin-bottom:10px}
        @media(max-width:1100px){.layout{grid-template-columns:1fr}.side-panel{position:static}}
      `}</style>

      <div className="page-shell">
        <div className="layout">
          <main>
            <section className="card progress-card">
              <h3 style={{ marginBottom: 16 }}>Ticket Progress</h3>
              <div className="progress-wrap">
                <div className="stage"><div className="dot active">✓</div><div>Open</div></div>
                <div className="connector"></div>
                <div className="stage"><div className={`dot ${stageState.inProgress ? "active" : ""}`}>{stageState.inProgress ? "✓" : "2"}</div><div>In Progress</div></div>
                <div className="connector"></div>
                <div className="stage"><div className={`dot ${stageState.resolved ? "active" : ""}`}>{stageState.resolved ? "✓" : "3"}</div><div>Resolved</div></div>
                <div className="connector"></div>
                <div className="stage"><div className={`dot ${stageState.closed ? "active" : ""}`}>{stageState.closed ? "✓" : "4"}</div><div>Closed</div></div>
              </div>
            </section>

            <section className="card post-shell">
              <div style={{ color: "#6b7280" }}>
                Posted by <strong>{ticket.reporterName}</strong> • {formatDate(ticket.createdAt)}
              </div>

              <h1 className="post-title">{ticket.title}</h1>
              <div className="status-chip">{ticket.status}</div>

              {ticket.imageUrls?.length > 0 && (
                <div className="detail-gallery">
                  {ticket.imageUrls.map((url, i) => (
                    <div className="image-tile" key={i}>
                      <img
                        src={`${BACKEND_URL}${url}`}
                        className="issue-image"
                        onClick={() => setPreviewImage(`${BACKEND_URL}${url}`)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="description">{ticket.description}</div>

              <h2 style={{ marginTop: 28 }}>Issue Summary</h2>
              <div className="summary-grid">
                <div className="summary-item"><strong>Category</strong><div>{ticket.category || "-"}</div></div>
                <div className="summary-item"><strong>Priority</strong><div>{ticket.priority || "-"}</div></div>
                <div className="summary-item"><strong>Status</strong><div>{ticket.status || "-"}</div></div>
                <div className="summary-item"><strong>Comments</strong><div>{comments.length}</div></div>
              </div>

              <section style={{ marginTop: 32 }}>
                <h2>Comments</h2>

                <button
                  className="btn btn-secondary"
                  style={{ margin: "14px 0" }}
                  onClick={() => {
                    setShowCommentForm(true);
                    setTimeout(() => {
                      commentFormRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Comments ({comments.length})
                </button>

                {showCommentForm && (
                  <div ref={commentFormRef} className="comment-form-wrap">
                    {replyToComment && (
                      <div className="reply-banner">
                        Replying to <strong>{replyToComment.author}</strong>:{" "}
                        {replyToComment.message}
                      </div>
                    )}

                    <div className="comment-entry-box">
                      <textarea
                        placeholder="Join the conversation..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />

                      <div className="comment-toolbar">
                        <div className="comment-toolbar-right">
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setShowCommentForm(false);
                              setNewComment("");
                              setReplyToComment(null);
                            }}
                          >
                            Cancel
                          </button>

                          <button className="btn btn-primary" onClick={handleAddComment}>
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {comments.length > 0 ? (
                  <div className="comments-list">
                    {buildCommentTree(comments).map((comment) =>
                      renderCommentNode(comment)
                    )}
                  </div>
                ) : (
                  <div>No comments yet.</div>
                )}
              </section>
            </section>
          </main>

          <aside className="card side-panel">
            <h3>Quick Actions</h3>
            <p style={{ color: "#6b7280" }}>Move through your support space quickly.</p>
            <Link to="/" className="quick-link">Return to Help Centre →</Link>
            <Link to="/my-reports" className="quick-link">View My Reports →</Link>
            <Link to="/create-ticket" className="quick-link">Create Another Report →</Link>
          </aside>
        </div>
      </div>

      {previewImage && (
        <div className="modal" onClick={() => setPreviewImage("")}>
          <img src={previewImage} alt="preview" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}