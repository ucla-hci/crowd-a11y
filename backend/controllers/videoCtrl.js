const asyncHandler = require('express-async-handler')
const axios = require('axios')

const User = require('../models/userModel')
const Video = require('../models/videoModel')

// @desc    Request new video info
// @route   POST /api/youtube
// @access  Private
const addVideo = asyncHandler( async (req, res) => {
  const { videoId } = req.body;
  const video = await Video.create({ videoId })
  res.status(201).json('created')
})

// @desc    Get one video info
// @route   GET /api/youtube/:id
// @access  Private
const getVideo = asyncHandler( async (req, res) => {
  
})

const videoCtrl = {
  addVideo,
  getVideo,
}

module.exports = videoCtrl