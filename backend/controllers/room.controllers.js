import Room from "../models/Room.js";

import Teacher from "../models/Teacher.js";

export const roomCreation = async (req, res) => {
  const { roomName, id } = req.body;
  console.log("This is created by teacher", id);
  try {
    const room = await Room.create({
      roomName,
      user: id,
    });
    console.log("Room ceation", room);
    if (!room) {
      throw new error("Room has not been created");
    }
    res.status(201).json({ message: "Room has been created", room });
  } catch (error) {
    console.error("error while creating room", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const generateMCQs = async (req, res) => {
//   try {
//     const { title, notes } = req.body;

//     if (!title || !notes) {
//       return res.status(400).json({
//         success: false,
//         message: "Title and notes are required",
//       });
//     }

//     // const aiResponse = await axios.post(
//     //   "http://localhost:5000/generate-summary",
//     //   { text: notes },
//     // );

//     // const summaryTxt = aiResponse.data.summary;
//     const summaryTxt = "this is summary text from backend";

//     const teacherContent = await Teacher.create({
//       user: req.user._id,
//       title,
//       notes,
//       summaryTxt,
//     });

//     // const sentences = notes.split(".").filter(Boolean);
//     // const mcqs = sentences.slice(0, 5).map((sentence) => ({
//     //   question: `What does the following statement mean?`,
//     //   options: [
//     //     sentence.trim(),
//     //     "Incorrect option A",
//     //     "Incorrect option B",
//     //     "Incorrect option C",
//     //   ],
//     //   correctAnswer: sentence.trim(),
//     // }));

//     res.status(201).json({
//       success: true,
//       message: "MCQs and summary generated successfully",
//       data: {
//         contentId: teacherContent._id,
//         title: teacherContent.title,
//         summaryTxt: teacherContent.summaryTxt,
//         // mcqs,
//       },
//     });
//   } catch (error) {
//     console.error("MCQ Generation Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while generating MCQs",
//     });
//   }
// };

export const generateMCQs = async (req, res) => {
  try {
    const { title, notes } = req.body;
    const pdfFile = req.file; // the uploaded PDF

    if (!title || !notes) {
      return res.status(400).json({
        success: false,
        message: "Title and notes are required",
      });
    }

    console.log("Uploaded PDF:", pdfFile.path); // file path

    // Now you can send `notes` and `pdfFile.path` to your AI model
    const aiResponse = await axios.post(
      "http://localhost:5000/generate-summary",
      { text: notes, filePath: pdfFile?.path }, // send file path if your AI model supports it
    );

    const summaryTxt = aiResponse.data.summary;

    const teacherContent = await Teacher.create({
      user: req.user._id,
      title,
      notes,
      summaryTxt,
    });

    res.status(201).json({
      success: true,
      message: "MCQs and summary generated successfully",
      data: {
        contentId: teacherContent._id,
        title: teacherContent.title,
        summaryTxt: teacherContent.summaryTxt,
      },
    });
  } catch (error) {
    console.error("MCQ Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating MCQs",
    });
  }
};
