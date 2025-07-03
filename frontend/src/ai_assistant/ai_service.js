// src/ai_assistant/ai_service.js
export const askAI = async (prompt, file) => {
  const formData = new FormData();
  formData.append("prompt", prompt);
  if (file) formData.append("file", file);

  const response = await fetch("http://localhost:8080/api/ai", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};
