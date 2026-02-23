import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import { MongoAPIError } from 'mongodb';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log( "accessToken: ", accessToken);
    console.log( "refreshToken: ",refreshToken);

    user.refreshToken = refreshToken;
    console.log(user);
    const yes = await user.save({ validateBeforeSave: false });
    console.log("usersave" , yes)

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error.message);
    throw new MongoAPIError(
      500,
      'Something went wrong while generating access and refresh tokens');
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, 'Unauthorized user');

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);
    if (!user) throw new ApiError(401, 'Invalid refresh Token');

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, 'Refresh token has been expired');

    const { accessToken, refreshToken: newRefreshToken } =
      generateAccessAndRefreshToken(user?._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed successfully',
        ),
      );

  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullname, username } = req.body;

  // REQ-BODY VALIDATIONS.
  if (!email || !password || !fullname || !username)
    throw new ApiError(400, 'Fullname, email and password, username are required.');

  if (password.length < 8)
    throw new ApiError(403, 'password must be at least 8 characters');

  const exists = await User.findOne({
    email: email.toLowerCase().trim(),
  });
  if (exists)
    throw new ApiError(403, 'user already exists');

  const user = await User.create({
    email: email.toLowerCase().trim(),
    username: username.toLowerCase().trim(),
    password: password,
    fullname: fullname.trim(),
    role: 'user',
    savedPlans: [],
  });

  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser)
    throw new ApiError(500, 'Something went wrong while creating new user');

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, 'User created successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(403, 'email and password are required.');

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user)
    throw new ApiError(400, 'user does not exist');

  // CHECK PASSWORD
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid)
    throw new ApiError(401, 'Invalid user credentials');

  // ACCESS & REFRESH TOKEN GENERATED.
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user?._id);

  // LOGGED IN USER
  const loggedInUser = await User.findById(user?._id).select(
    ' -password -refreshToken',
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        'User logged in successfully',
      ),
    );

});

export const logout = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, // IT REMOVES REFRESH TOKEN
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export const me = asyncHandler(async (req, res) => {
  const user = req?.user;
  if (!user) throw new ApiError(401, 'Unauthorized access');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Fetched your details'));
});
