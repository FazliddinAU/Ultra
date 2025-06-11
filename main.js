const TelegramBot = require('node-telegram-bot-api');
const token = '7712917607:AAGWZOqW4ZvXE1KQ7nLleRWYe29gaSFzte8';
const bot = new TelegramBot(token, { polling: true });

const channelId = -1002685585323;
const channelName = `To'g'risini aytsam`;
const channelInviteLink = 'https://t.me/+1DmiBcsjkPQwNDc6';

const subscribeButton = {
  text: `${channelName}`,
  url: channelInviteLink
};

const confirmSubscriptionButton = {
  text: '✅ Obunani tasdiqlash',
  callback_data: 'confirm_subscription'
};

const registrationButton = {
  text: `O'yin uchun ro'yxatdan o'tish`,
  callback_data: 'register_game'
};

const registeredUsers = new Map();

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const member = await bot.getChatMember(channelId, userId);
    if (['member', 'administrator', 'creator'].includes(member.status)) {
      bot.sendMessage(chatId, `O'yin uchun ro'yxatdan o'tish tugmasini bosing:`, {
        reply_markup: {
          inline_keyboard: [[registrationButton]]
        }
      });
    } else {
      bot.sendMessage(chatId, `Iltimos, quyidagi kanalga obuna bo'ling:`, {
        reply_markup: {
          inline_keyboard: [[subscribeButton], [confirmSubscriptionButton]]
        }
      });
    }
  } catch (e) {
    bot.sendMessage(chatId, `Iltimos, quyidagi kanalga obuna bo'ling:`, {
      reply_markup: {
        inline_keyboard: [[subscribeButton], [confirmSubscriptionButton]]
      }
    });
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (data === 'confirm_subscription') {
    try {
      const member = await bot.getChatMember(channelId, userId);
      if (['member', 'administrator', 'creator'].includes(member.status)) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Obunangiz tasdiqlandi!' });
        bot.sendMessage(chatId, `O'yin uchun ro'yxatdan o'tish tugmasini bosing:`, {
          reply_markup: {
            inline_keyboard: [[registrationButton]]
          }
        });
      } else {
        await bot.answerCallbackQuery(callbackQuery.id, { text: `Siz kanalga obuna bo'lmagansiz!` });
      }
    } catch (e) {
      await bot.answerCallbackQuery(callbackQuery.id, { text: `Xatolik yuz berdi. Iltimos, yana urinib ko'ring.` });
    }
  }

  if (data === 'register_game') {
    if (registeredUsers.has(userId)) {
      await bot.answerCallbackQuery(callbackQuery.id, { text:  `Siz o'yin uchun allaqachon ro'yxatdan o'tgan ekansiz!` });
    } else {
      const randomNum = Math.floor(Math.random() * 100) + 1;
      const lastDigit = randomNum % 10;
      let response = `<blockquote>💡 Sizga tasodifiy son berildi: ${randomNum}</blockquote>\n\n`;

      if ([2, 6, 7, 0].includes(lastDigit)) {
        response += `<b>⭐ Siz o'yinda qatnasha olasiz!</b> \n\n <b> Savollar uchun : @inqiIob </b>`;
      } else {
        response += `<b>❗ Kechirasiz, siz o'yinda qatnasha olmaysiz.</b> \n\n <b> Savollar uchun : @inqiIob </b>`;
      }

      registeredUsers.set(userId, randomNum);
      await bot.answerCallbackQuery(callbackQuery.id);
      bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
    }
  }
});
