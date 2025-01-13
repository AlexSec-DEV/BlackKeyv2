const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

// Her dakika çalışacak cron job (test için)
const startInvestmentCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Yatırım kontrolü başlatılıyor...', new Date().toLocaleString());
      
      // Aktif ve süresi dolan yatırımları bul
      const completedInvestments = await Investment.find({
        status: 'ACTIVE',
        endDate: { $lte: new Date() }
      });

      console.log(`${completedInvestments.length} adet tamamlanan yatırım bulundu`);

      for (const investment of completedInvestments) {
        try {
          // Kullanıcıyı bul
          const user = await User.findById(investment.user);
          if (!user) {
            console.log(`Kullanıcı bulunamadı: ${investment.user}`);
            continue;
          }

          // Toplam kazancı hesapla (yatırım + getiri)
          const totalAmount = investment.amount + investment.totalReturn;

          // Kullanıcının bakiyesini güncelle
          const oldBalance = user.balance;
          user.balance += totalAmount;
          await user.save();

          // Yatırımı tamamlandı olarak işaretle ve sil
          await Investment.findByIdAndDelete(investment._id);

          console.log(`
            Yatırım tamamlandı:
            - Yatırım ID: ${investment._id}
            - Kullanıcı: ${user.username}
            - Eski bakiye: ${oldBalance}
            - Kazanç: ${totalAmount}
            - Yeni bakiye: ${user.balance}
          `);
        } catch (err) {
          console.error(`Yatırım işlenirken hata: ${investment._id}`, err);
        }
      }
    } catch (err) {
      console.error('Cron job hatası:', err);
    }
  });
};

module.exports = startInvestmentCron;