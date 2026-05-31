# AI Web Application

একটি আধুনিক ওয়েব অ্যাপ্লিকেশন যাতে রয়েছে ব্যবহারকারী লগইন এবং লগআউট সিস্টেম।

## বৈশিষ্ট্য
- ✅ নিরাপদ ব্যবহারকারী প্রমাণীকরণ
- ✅ JWT টোকেন ভিত্তিক সেশন ম্যানেজমেন্ট
- ✅ পাসওয়ার্ড এনক্রিপশন (bcrypt)
- ✅ স্টেটলেস API আর্কিটেকচার
- ✅ Responsive Frontend

## প্রযুক্তি স্ট্যাক
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## ইনস্টলেশন

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

### Frontend Setup
```bash
cd frontend
open index.html
```

## API এন্ডপয়েন্ট
- `POST /api/auth/register` - নতুন ব্যবহারকারী রেজিস্টার করুন
- `POST /api/auth/login` - লগইন করুন
- `POST /api/auth/logout` - লগআউট করুন
- `GET /api/auth/profile` - ব্যবহারকারী প্রোফাইল পান

## লাইসেন্স
MIT
