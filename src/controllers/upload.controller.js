export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    message: "File uploaded successfully",
    file: {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      path: `/uploads/${req.file.filename}`
    }
  });
};
