const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  // Search for the job in the database created by a user with the userId and sort it by the time it was created
  const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
  // send status and response
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};
const getJob = async (req, res) => {
  // Destructure the userId and jobId from the database
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  // Find the job by the jobId and the userId of the user that created the job
  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });
  // Check if the job is present in the database
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  // Send the status and response
  res.status(StatusCodes.OK).json({ job });
};

// Create a Job
const createJob = async (req, res) => {
  // Get the userId of the user
  req.body.createdBy = req.user.userId;
  // create the job
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// Update a Job
const updateJob = async (req, res) => {
  // Destructure the userId and jobId from the database and the body of the request
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  // check if the company and position are in the req body
  if (company === "" || position === "") {
    throw new BadRequestError("Company or Position fields cannot be empty");
  }

  // Search for the  job with the userId and jobId the also run the validators
  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  // check if job is found
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

// Delete a Job
const deleteJob = async (req, res) => {
  // Destructure the userId and jobId from the database
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  // Search for the  job with the userId and jobId
  const job = await Job.findByIdAndRemove({ createdBy: userId, _id: jobId });
  // check if job is found
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ message: `job with id: ${jobId} has been deleted` });
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
