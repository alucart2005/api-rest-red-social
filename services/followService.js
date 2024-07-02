const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
  try {
    let following = await Follow.find({ user: identityUserId })
      .select({
        followed: 1,
        _id: 0,
      })
      .lean();

    let followers = await Follow.find({ followed: identityUserId })
      .select({
        user: 1,
        _id: 0,
      })
      .lean();

    // Procesar array de identificadores
    let followingClean = [];
    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

    let followersClean = [];
    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });

    return {
      following: followingClean,
      followers: followersClean,
    };
  } catch (error) {
    console.error("Error en followUserIds:", error);
    return {
      following: [],
      followers: [],
    };
  }
};
/* followUserIds Ver.2
const followUserIds = async (identityUserId) => {
  try {
    const [following, followers] = await Promise.all([
      Follow.find({ user: identityUserId }, { followed: 1, _id: 0 }).lean(),
      Follow.find({ followed: identityUserId }, { user: 1, _id: 0 }).lean()
    ]);

    return {
      following: following.map(follow => follow.followed.toString()),
      followers: followers.map(follow => follow.user.toString())
    };
  } catch (error) {
    console.error("Error en followUserIds:", error);
    return {
      following: [],
      followers: []
    };
  }
};
*/

const followThisUser = async (identityUserId, profileUserId) => {
  try {
    let following = await Follow.findOne({
      user: identityUserId,
      followed: profileUserId,
    }).lean();
    let follower = await Follow.findOne({
      user: profileUserId,
      followed: identityUserId,
    }).lean();
    return {
      following,
      follower,
    };
  } catch (error) {
    console.error("Error en followThisUser:", error);
    return {
      following: [],
      follower: [],
    };
  }
};

module.exports = {
  followUserIds,
  followThisUser,
};
