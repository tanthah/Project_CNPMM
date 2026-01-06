import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";
import { Coupon } from "../models/Coupon.js";
import LoyaltyPoint from "../models/LoyaltyPoint.js";
import { sendWelcomeEmail } from "../services/emailService.js";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Tìm user theo Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Kiểm tra email đã tồn tại chưa
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Liên kết Google account với user hiện tại
            user.googleId = profile.id;
            user.isVerified = true;
            await user.save();
          } else {
            // Tạo user mới
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0]?.value,
              isVerified: true,
            });

            // === TẠO QUÀ TẶNG CHÀO MỪNG CHO USER MỚI TỪ GOOGLE ===
            try {
              const welcomePoints = 20;

              // 1. Tạo mã giảm giá 10%
              const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              const couponCode = `WELCOME${randomCode}`;

              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 30);

              await Coupon.create({
                code: couponCode,
                type: 'percentage',
                value: 10,
                minOrderValue: 0,
                maxDiscount: 500000,
                maxUses: 1,
                userId: user._id,
                expiryDate: expiryDate,
                isActive: true,
                source: 'registration',
                sourceId: user._id,
                description: 'Mã giảm giá 10% chào mừng thành viên mới (Google)'
              });

              console.log('Welcome coupon created for Google user:', couponCode);

              // 2. Cộng 20 điểm thưởng
              let loyaltyPoint = await LoyaltyPoint.findOne({ userId: user._id });

              if (!loyaltyPoint) {
                loyaltyPoint = new LoyaltyPoint({
                  userId: user._id,
                  totalPoints: 0,
                  availablePoints: 0,
                  usedPoints: 0,
                  history: []
                });
              }

              await loyaltyPoint.addPoints(
                welcomePoints,
                'Điểm thưởng chào mừng thành viên mới (Google)',
                user._id,
                'registration'
              );

              console.log(' Welcome points added for Google user:', welcomePoints);

              // 3. Gửi email chào mừng
              await sendWelcomeEmail(profile.emails[0].value, {
                name: profile.displayName,
                couponCode: couponCode,
                points: welcomePoints
              });

            } catch (welcomeErr) {
              console.error(' Failed to create welcome gifts for Google user:', welcomeErr.message);
            }
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;