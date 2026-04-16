// src/pages/tickets/TicketDetails.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  MessageSquare,
  Image as ImageIcon,
  X,
  ChevronLeft,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CornerDownRight,
  Edit3,
  Trash2,
  Heart,
  Hash,
} from "lucide-react";

const BACKEND_URL = "http://localhost:8080";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentImages, setCommentImages] = useState([]);
  const [commentImagePreview, setCommentImagePreview] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [editingImages, setEditingImages] = useState([]);
  const [existingEditImages, setExistingEditImages] = useState([]);
  const [replyToComment, setReplyToComment] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const commentFormRef = useRef(null);
  const commentNodeRefs = useRef({});
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole") || "USER";
  const userName = localStorage.getItem("userName") || "Anonymous";

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
      setLikeCount(ticketRes.data?.likeCount || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && commentImages.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("author", userEmail);
      formData.append("message", newComment);
      formData.append("authorRole", userRole.toUpperCase());
      formData.append("authorName", userName);

      if (replyToComment?.id) {
        formData.append("parentId", replyToComment.id);
      }

      commentImages.forEach((file) => {
        formData.append("images", file);
      });

      const res = await axios.post(
        `${BACKEND_URL}/api/tickets/${ticketId}/comments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
      setCommentImages([]);
      setCommentImagePreview([]);
      setShowCommentForm(false);
      setReplyToComment(null);
    } catch (err) {
      console.error("Add comment failed:", err.response?.data || err);
    }
  };

  const startEditComment = (comment) => {
    setEditingId(comment.id);
    setEditingMessage(comment.message || "");
    setExistingEditImages(comment.imageUrls || []);
    setEditingImages([]);
  };

const handleEditComment = async (commentId) => {
  if (!editingMessage.trim() && existingEditImages.length === 0 && editingImages.length === 0) {
    alert("Please add a message or at least one image");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("author", userEmail);
    formData.append("authorRole", userRole.toUpperCase());
    formData.append("message", editingMessage);
    formData.append("existingImages", JSON.stringify(existingEditImages));

    editingImages.forEach((file) => {
      formData.append("images", file);
    });

    // Changed from PUT to POST and added /edit to URL
    const res = await axios.post(
      `${BACKEND_URL}/api/tickets/${ticketId}/comments/${commentId}/edit`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? res.data : c))
    );

    setEditingId(null);
    setEditingMessage("");
    setEditingImages([]);
    setExistingEditImages([]);
  } catch (err) {
    console.error("Edit failed:", err.response?.data || err);
    alert(`Failed to save: ${err.response?.data?.message || err.message}`);
  }
};

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/tickets/${ticketId}/comments/${commentId}?author=${userEmail}&authorRole=${userRole.toUpperCase()}`
      );

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (commentImages.length + files.length > 3) {
      alert("Maximum 3 images allowed per comment");
      return;
    }

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      alert("Only image files are allowed");
      return;
    }

    setCommentImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImagePreview((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleEditImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = existingEditImages.length + editingImages.length + files.length;
    if (totalImages > 3) {
      alert("Maximum 3 images allowed total");
      return;
    }

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    setEditingImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeCommentImage = (index) => {
    setCommentImages((prev) => prev.filter((_, i) => i !== index));
    setCommentImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditImage = (index) => {
    setEditingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingEditImage = (index) => {
    setExistingEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date) => {
    if (!date) return "Just now";
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatFullDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
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

  const getStatusConfig = (status) => {
    const s = (status || "open").toLowerCase();
    const configs = {
      new: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: AlertCircle, label: "New" },
      open: { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: Clock, label: "Open" },
      "in progress": { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", icon: Loader2, label: "In Progress" },
      resolved: { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: CheckCircle2, label: "Resolved" },
      closed: { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb", icon: CheckCircle2, label: "Closed" },
      rejected: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: AlertCircle, label: "Rejected" },
    };
    return configs[s] || configs.new;
  };

  const getPriorityConfig = (priority) => {
    const p = (priority || "low").toLowerCase();
    const configs = {
      low: { color: "#6b7280", bg: "#f3f4f6", label: "Low" },
      medium: { color: "#3b82f6", bg: "#eff6ff", label: "Medium" },
      high: { color: "#f59e0b", bg: "#fffbeb", label: "High" },
      urgent: { color: "#ef4444", bg: "#fef2f2", label: "Urgent" },
    };
    return configs[p] || configs.low;
  };

  const sortedComments = useMemo(() => {
    const sorted = [...comments];
    if (sortBy === "newest") {
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === "oldest") {
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return sorted;
  }, [comments, sortBy]);

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

  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Like failed:", err);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    }
  };

  const renderCommentNode = (comment, level = 0) => {
    const canModify =
      comment.author === userEmail ||
      userRole.toUpperCase() === "ADMIN";

    const isReply = level > 0;

    return (
      <div
        key={comment.id}
        ref={(el) => {
          if (el) commentNodeRefs.current[comment.id] = el;
        }}
        style={{
          marginLeft: isReply ? `${Math.min(level * 28, 84)}px` : "0px",
          marginTop: isReply ? "12px" : "0px",
        }}
      >
        <div style={styles.commentItem}>
          <div style={styles.commentLine}></div>

          <div style={styles.commentBody}>
            <div style={styles.commentTop}>
              <span style={styles.commentAuthor}>{comment.author}</span>
              {comment.authorRole && (
                <span style={styles.roleBadge}>{comment.authorRole}</span>
              )}
              <span style={styles.commentTime}>{formatDate(comment.createdAt)}</span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span style={styles.editedBadge}>edited</span>
              )}
            </div>

            {editingId === comment.id ? (
              <>
                <textarea
                  style={styles.editCommentTextarea}
                  value={editingMessage}
                  onChange={(e) => setEditingMessage(e.target.value)}
                  placeholder="Edit your comment..."
                />

                {existingEditImages.length > 0 && (
                  <div style={styles.editImageGrid}>
                    <p style={styles.editImageLabel}>Current images (click X to remove):</p>
                    <div style={styles.smallPreviewGrid}>
                      {existingEditImages.map((url, i) => (
                        <div key={`existing-${i}`} style={styles.smallPreviewItem}>
                          <img 
                            src={`${BACKEND_URL}${url}`} 
                            alt={`Current ${i + 1}`} 
                            style={styles.smallPreviewImage}
                            onClick={() => setPreviewImage(`${BACKEND_URL}${url}`)}
                          />
                          <button
                            style={styles.smallRemoveBtn}
                            onClick={() => removeExistingEditImage(i)}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.editImageUpload}>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    style={styles.editUploadBtn}
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={existingEditImages.length + editingImages.length >= 3}
                  >
                    <ImageIcon size={14} />
                    Add New Image ({existingEditImages.length + editingImages.length}/3)
                  </button>
                </div>

                {editingImages.length > 0 && (
                  <div style={styles.smallPreviewGrid}>
                    {editingImages.map((file, i) => (
                      <div key={`new-${i}`} style={styles.smallPreviewItem}>
                        <span style={styles.fileNameLabel}>{file.name}</span>
                        <button
                          style={styles.smallRemoveBtn}
                          onClick={() => removeEditImage(i)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.commentActions}>
                  <button
                    style={styles.saveCommentBtn}
                    onClick={() => handleEditComment(comment.id)}
                  >
                    Save Changes
                  </button>
                  <button
                    style={styles.cancelEditBtn}
                    onClick={() => {
                      setEditingId(null);
                      setEditingMessage("");
                      setEditingImages([]);
                      setExistingEditImages([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.commentText}>{comment.message}</div>

                {comment.imageUrls?.length > 0 && (
                  <div style={styles.commentImagesSmall}>
                    {comment.imageUrls.map((url, i) => (
                      <div key={i} style={styles.commentImageThumbWrapper}>
                        <img
                          src={`${BACKEND_URL}${url}`}
                          alt={`Comment image ${i + 1}`}
                          style={styles.commentImageThumb}
                          onClick={() => setPreviewImage(`${BACKEND_URL}${url}`)}
                        />
                        <div style={styles.zoomHint}>Click to zoom</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.commentActions}>
                  <button
                    style={styles.actionBtn}
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
                        style={styles.actionBtn}
                        onClick={() => startEditComment(comment)}
                      >
                        Edit
                      </button>

                      <button
                        style={{ ...styles.actionBtn, color: "#ef4444" }}
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
  const statusConfig = useMemo(() => getStatusConfig(ticket?.status), [ticket]);
  const priorityConfig = useMemo(() => getPriorityConfig(ticket?.priority), [ticket]);
  const StatusIcon = statusConfig.icon;

  if (loading) return <div style={{ padding: 30 }}>Loading ticket details...</div>;
  if (!ticket) return <div style={{ padding: 30 }}>Ticket not found.</div>;

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={styles.pageShell}>
        <div style={styles.layout}>
          <main>
            {/* Progress Card */}
            <section style={styles.progressCard}>
              <h3 style={{ marginBottom: 16 }}>Ticket Progress</h3>
              <div style={styles.progressWrap}>
                <div style={styles.stage}><div style={{...styles.dot, ...(stageState.open ? styles.dotActive : {})}}>{stageState.open ? "✓" : "1"}</div><div>Open</div></div>
                <div style={styles.connector}></div>
                <div style={styles.stage}><div style={{...styles.dot, ...(stageState.inProgress ? styles.dotActive : {})}}>{stageState.inProgress ? "✓" : "2"}</div><div>In Progress</div></div>
                <div style={styles.connector}></div>
                <div style={styles.stage}><div style={{...styles.dot, ...(stageState.resolved ? styles.dotActive : {})}}>{stageState.resolved ? "✓" : "3"}</div><div>Resolved</div></div>
                <div style={styles.connector}></div>
                <div style={styles.stage}><div style={{...styles.dot, ...(stageState.closed ? styles.dotActive : {})}}>{stageState.closed ? "✓" : "4"}</div><div>Closed</div></div>
              </div>
            </section>

            {/* Main Ticket Card */}
            <section style={styles.postShell}>
              {/* Header with Like Button */}
              <div style={styles.ticketHeader}>
                <div style={styles.authorSection}>
                  <div style={styles.authorAvatar}>
                    {ticket.reporterName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div style={styles.authorName}>{ticket.reporterName}</div>
                    <div style={styles.postTime}>{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>

                <button
                  style={{
                    ...styles.likeButton,
                    background: isLiked ? "#fef2f2" : "#f3f4f6",
                    color: isLiked ? "#ef4444" : "#6b7280",
                  }}
                  onClick={handleLike}
                >
                  <Heart size={20} fill={isLiked ? "#ef4444" : "none"} />
                  <span>{likeCount}</span>
                </button>
              </div>

              <h1 style={styles.postTitle}>{ticket.title}</h1>
              
              {/* Tags Row */}
              <div style={styles.tagsRow}>
                <span style={{
                  ...styles.tag,
                  background: statusConfig.bg,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.border}`,
                }}>
                  <StatusIcon size={14} />
                  {ticket.status || "New"}
                </span>

                <span style={{
                  ...styles.tag,
                  background: priorityConfig.bg,
                  color: priorityConfig.color,
                  border: `1px solid ${priorityConfig.color}40`,
                }}>
                  <AlertCircle size={14} />
                  {priorityConfig.label} Priority
                </span>

                <span style={styles.categoryTag}>
                  <Tag size={14} />
                  {ticket.category || "General"}
                </span>
              </div>

              {/* Ticket Images */}
              {ticket.imageUrls?.length > 0 && (
                <div style={styles.detailGallery}>
                  {ticket.imageUrls.map((url, i) => (
                    <div style={styles.imageTile} key={i}>
                      <img
                        src={`${BACKEND_URL}${url}`}
                        style={styles.issueImage}
                        onClick={() => setPreviewImage(`${BACKEND_URL}${url}`)}
                        alt={`Ticket image ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.description}>{ticket.description}</div>

              <h2 style={{ marginTop: 28 }}>Issue Summary</h2>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}><strong>Category</strong><div>{ticket.category || "-"}</div></div>
                <div style={styles.summaryItem}><strong>Priority</strong><div>{ticket.priority || "-"}</div></div>
                <div style={styles.summaryItem}><strong>Status</strong><div>{ticket.status || "-"}</div></div>
                <div style={styles.summaryItem}><strong>Comments</strong><div>{comments.length}</div></div>
              </div>

              {/* Comments Section */}
              <section style={{ marginTop: 32 }}>
                <div style={styles.commentsHeader}>
                  <h2>Comments ({comments.length})</h2>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={styles.sortSelect}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                <button
                  style={styles.commentToggleBtn}
                  onClick={() => {
                    setShowCommentForm(!showCommentForm);
                    setReplyToComment(null);
                  }}
                >
                  {showCommentForm ? "Cancel" : `Comments (${comments.length})`}
                </button>

                {showCommentForm && (
                  <div ref={commentFormRef} style={styles.commentFormWrap}>
                    {replyToComment && (
                      <div style={styles.replyBanner}>
                        Replying to <strong>{replyToComment.author}</strong>: {replyToComment.message}
                        <button style={styles.clearReplyBtn} onClick={() => setReplyToComment(null)}>×</button>
                      </div>
                    )}

                    <div style={styles.commentEntryBox}>
                      <textarea
                        placeholder="Join the conversation..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={styles.commentTextarea}
                      />

                      <div style={styles.commentToolbar}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          style={{ display: "none" }}
                        />
                        <button
                          style={styles.uploadTrigger}
                          onClick={() => fileInputRef.current?.click()}
                          disabled={commentImages.length >= 3}
                        >
                          <ImageIcon size={16} />
                          Images ({commentImages.length}/3)
                        </button>
                      </div>

                      {commentImagePreview.length > 0 && (
                        <div style={styles.previewGrid}>
                          {commentImagePreview.map((preview, i) => (
                            <div key={i} style={styles.previewItem}>
                              <img src={preview} alt="" style={styles.previewImg} />
                              <button style={styles.removeBtn} onClick={() => removeCommentImage(i)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={styles.formActions}>
                        <button style={styles.secondaryBtn} onClick={() => {
                          setShowCommentForm(false);
                          setNewComment("");
                          setCommentImages([]);
                          setCommentImagePreview([]);
                          setReplyToComment(null);
                        }}>Cancel</button>
                        <button style={styles.primaryBtn} onClick={handleAddComment}>Post Comment</button>
                      </div>
                    </div>
                  </div>
                )}

                <div style={styles.commentsList}>
                  {sortedComments.length > 0 ? (
                    buildCommentTree(sortedComments).map((comment) =>
                      renderCommentNode(comment)
                    )
                  ) : (
                    <div style={styles.emptyComments}>No comments yet. Be the first to comment!</div>
                  )}
                </div>
              </section>
            </section>
          </main>

          {/* SIDEBAR - Quick Actions FIRST, Ticket Info SECOND */}
          <aside style={styles.sidePanel}>
            {/* Quick Actions Card - FIRST */}
            <div style={styles.quickActionsCard}>
              <h3 style={styles.infoCardTitle}>Quick Actions</h3>
              <p style={styles.quickActionsText}>Navigate through your support space</p>
              
              <Link to="/support" style={styles.quickLink}>
                <ChevronLeft size={16} />
                Return to Help Centre
              </Link>
              <Link to="/my-reports" style={styles.quickLink}>
                <ChevronLeft size={16} />
                View My Reports
              </Link>
              <Link to="/create-ticket" style={styles.quickLink}>
                <ChevronLeft size={16} />
                Create Another Report
              </Link>
            </div>

            {/* Ticket Info Card - SECOND */}
            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>
                <Hash size={18} />
                Ticket Information
              </h3>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Ticket ID</span>
                <span style={styles.infoValue}>#{ticket.id}</span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Created</span>
                <span style={styles.infoValue}>{formatFullDate(ticket.createdAt)}</span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span style={{...styles.infoValue, color: statusConfig.color}}>
                  {ticket.status || "New"}
                </span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Priority</span>
                <span style={{...styles.infoValue, color: priorityConfig.color}}>
                  {ticket.priority || "Low"}
                </span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Category</span>
                <span style={styles.infoValue}>{ticket.category || "General"}</span>
              </div>
              
              {ticket.location && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Location</span>
                  <span style={styles.infoValue}>{ticket.location}</span>
                </div>
              )}
              
              {ticket.contactNumber && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Contact</span>
                  <span style={styles.infoValue}>{ticket.contactNumber}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Image Modal */}
      {previewImage && (
        <div style={styles.modal} onClick={() => setPreviewImage("")}>
          <button style={styles.modalClose} onClick={() => setPreviewImage("")}>×</button>
          <img src={previewImage} alt="preview" style={styles.modalImg} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

const styles = {
  pageShell: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "28px 24px 56px",
    background: "#f6f7f8",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 320px",
    gap: "28px",
    alignItems: "start",
  },
  progressCard: {
    background: "#fff",
    border: "1px solid #edeff1",
    borderRadius: "18px",
    padding: "24px 28px",
    marginBottom: "18px",
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  stage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dot: {
    width: "30px",
    height: "30px",
    borderRadius: "999px",
    border: "2px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#9ca3af",
    background: "#fff",
  },
  dotActive: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },
  connector: {
    width: "52px",
    height: "3px",
    background: "#dbeafe",
    borderRadius: "2px",
  },
  postShell: {
    background: "#fff",
    border: "1px solid #edeff1",
    borderRadius: "18px",
    padding: "28px 30px 30px",
  },
  ticketHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #f3f4f6",
  },
  authorSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  authorAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
  },
  authorName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: "15px",
  },
  postTime: {
    fontSize: "13px",
    color: "#6b7280",
  },
  likeButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  postTitle: {
    fontSize: "42px",
    fontWeight: "700",
    margin: "16px 0",
    lineHeight: "1.2",
    color: "#0f172a",
  },
  tagsRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  categoryTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    background: "#f3f4f6",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  detailGallery: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    margin: "20px 0",
  },
  imageTile: {
    height: "180px",
    overflow: "hidden",
    borderRadius: "12px",
  },
  issueImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    cursor: "zoom-in",
    transition: "transform 0.2s",
  },
  description: {
    fontSize: "18px",
    lineHeight: "1.9",
    color: "#1f2937",
    whiteSpace: "pre-line",
    marginBottom: "20px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginTop: "18px",
  },
  summaryItem: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
  },
  commentsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sortSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "14px",
  },
  commentToggleBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "11px 18px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#e5e7eb",
    marginBottom: "20px",
  },
  commentFormWrap: {
    marginBottom: "26px",
  },
  replyBanner: {
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    color: "#3730a3",
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "12px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  clearReplyBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: "#3730a3",
  },
  commentEntryBox: {
    border: "1px solid #d1d5db",
    borderRadius: "18px",
    background: "#fff",
    overflow: "hidden",
  },
  commentTextarea: {
    width: "100%",
    minHeight: "120px",
    border: "none",
    outline: "none",
    padding: "18px",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  commentToolbar: {
    display: "flex",
    padding: "14px 16px",
    borderTop: "1px solid #edeff1",
    background: "#fafafa",
  },
  uploadTrigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "12px",
    padding: "14px 16px",
    borderTop: "1px solid #edeff1",
  },
  previewItem: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  removeBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "14px 16px",
    borderTop: "1px solid #edeff1",
  },
  secondaryBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "10px 16px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#e5e7eb",
  },
  primaryBtn: {
    border: "none",
    borderRadius: "999px",
    padding: "10px 16px",
    fontWeight: "700",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  emptyComments: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af",
  },
  commentItem: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },
  commentLine: {
    width: "2px",
    background: "#e5e7eb",
    borderRadius: "999px",
    alignSelf: "stretch",
    minHeight: "40px",
  },
  commentBody: {
    flex: 1,
  },
  commentTop: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  commentAuthor: {
    fontWeight: "700",
    color: "#0f172a",
  },
  roleBadge: {
    padding: "2px 8px",
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  editedBadge: {
    fontSize: "11px",
    color: "#9ca3af",
    fontStyle: "italic",
  },
  commentTime: {
    fontSize: "13px",
    color: "#6b7280",
  },
  commentText: {
    lineHeight: "1.8",
    marginBottom: "10px",
    color: "#374151",
  },
  commentImagesSmall: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  commentImageThumbWrapper: {
    position: "relative",
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    border: "1px solid #e5e7eb",
  },
  commentImageThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.2s",
  },
  zoomHint: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: "9px",
    padding: "2px 4px",
    textAlign: "center",
  },
  commentActions: {
    display: "flex",
    gap: "12px",
  },
  actionBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
  },
  editCommentTextarea: {
    width: "100%",
    minHeight: "90px",
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "12px",
    fontFamily: "inherit",
    fontSize: "14px",
    resize: "vertical",
  },
  editImageGrid: {
    marginBottom: "12px",
  },
  editImageLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  smallPreviewGrid: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  smallPreviewItem: {
    position: "relative",
    width: "60px",
    height: "60px",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  smallPreviewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    cursor: "pointer",
  },
  smallRemoveBtn: {
    position: "absolute",
    top: "2px",
    right: "2px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileNameLabel: {
    fontSize: "10px",
    padding: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  editImageUpload: {
    marginBottom: "12px",
  },
  editUploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    background: "#f3f4f6",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  saveCommentBtn: {
    padding: "8px 16px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelEditBtn: {
    padding: "8px 16px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  sidePanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  quickActionsCard: {
    background: "#fff",
    border: "1px solid #edeff1",
    borderRadius: "18px",
    padding: "24px",
  },
  infoCard: {
    background: "#fff",
    border: "1px solid #edeff1",
    borderRadius: "18px",
    padding: "24px",
  },
  infoCardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "16px",
  },
  quickActionsText: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  quickLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    background: "#f9fafb",
    borderRadius: "12px",
    color: "#374151",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
    transition: "background 0.2s",
    border: "1px solid #e5e7eb",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  infoLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: "700",
  },
  modal: {
    display: "flex",
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    zIndex: 9999,
  },
  modalClose: {
    position: "absolute",
    top: "20px",
    right: "24px",
    fontSize: "40px",
    color: "#fff",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  modalImg: {
    maxWidth: "92vw",
    maxHeight: "88vh",
    borderRadius: "18px",
  },
};