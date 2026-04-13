import api from "./api";

// =======================
// CREATE TICKET WITH FILES
// =======================
export const createTicket = (ticketData) => {
  const formData = new FormData();

  // ✅ IMPORTANT FIX: ensure backend-required fields exist
  if (ticketData.title) {
    formData.append("title", ticketData.title);
  }

  if (ticketData.subject) {
    formData.append("subject", ticketData.subject);
  }

  // append all other fields safely
  Object.keys(ticketData).forEach((key) => {
    if (key === "attachments" && ticketData.attachments) {
      ticketData.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    } else if (
      key !== "title" &&   // prevent duplicate
      key !== "subject" && // prevent duplicate
      ticketData[key] !== null &&
      ticketData[key] !== undefined
    ) {
      formData.append(key, ticketData[key]);
    }
  });

  return api.post("/tickets/with-files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// =======================
// EDIT OWN TICKET WITH FILES
// =======================
export const editTicket = (id, reporterEmail, data) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key === "files" && data.files) {
      data.files.forEach((file) => {
        formData.append("files", file);
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return api.put(
    `/tickets/${id}/edit-with-files?reporterEmail=${reporterEmail}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// =======================
// GET ALL TICKETS
// =======================
export const getAllTickets = () => api.get("/tickets");

// =======================
// GET MY TICKETS
// =======================
export const getMyTickets = (email) =>
  api.get(`/tickets/reporter?email=${email}`);

// =======================
// UPDATE STATUS
// =======================
export const updateTicketStatus = (id, role, data, userName) =>
  api.put(`/tickets/${id}/status/${role}?userName=${userName}`, data);

// =======================
// GET TICKET BY ID
// =======================
export const getTicketById = (id) => api.get(`/tickets/${id}`);

// =======================
// COMMENTS
// =======================

// ✅ ADD COMMENT FIXED
export const addComment = (
  ticketId,
  author,
  message,
  images = [],
  parentId = null,
  authorRole = "USER"
) => {
  const formData = new FormData();
  formData.append("author", author);
  formData.append("message", message);
  formData.append("authorRole", authorRole);

  if (parentId) {
    formData.append("parentId", parentId);
  }

  if (images && images.length > 0) {
    images.forEach((img) => {
      formData.append("images", img);
    });
  }

  return api.post(`/tickets/${ticketId}/comments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getCommentsByTicket = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`);

// =======================
// EDIT COMMENT FIXED
// =======================
export const editComment = (
  ticketId,
  commentId,
  author,
  role,
  message
) =>
  api.put(
    `/tickets/${ticketId}/comments/${commentId}?author=${author}&authorRole=${role}`,
    { message }
  );

// =======================
// DELETE COMMENT FIXED
// =======================
export const deleteComment = (ticketId, commentId, author, role) =>
  api.delete(
    `/tickets/${ticketId}/comments/${commentId}?author=${author}&authorRole=${role}`
  );