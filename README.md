Tas-ix Checker
=============

http://farhodjon.uz/projects/tasix-checker/

Saytlarni Tasix tarmog‘ida (http://tas-ix.uz/) joylashganligini tekshiradigan kengaytma (brauzerlar uchun). Kengaytma saytlarni Tas-ix tarmog‘ida joylashganini tekshiradi va har bir tabga mos ikonka ko‘rsatadi.
Mos indikator brauzer oynasida paydo bo‘ladi va uch xil rang oladi:
1. Kulrang — sayt tekshirilyapti yoki tekshirish shart emas.
2. Qizil — sayt Tas-ix tarmog‘idan tashqarida.
3. Yashil — sayt Tas-ix tarmog‘i ichida.

2.0 versiya O‘zbekiston Respublikasi mustaqilligining 22 yillik bayramiga bag‘ishlanadi.

## Ushbu versiyada

Endi kengaytma saytlarni lokal tekshiradi. [chrome.webRequest](http://developer.chrome.com/extensions/webRequest.html) API orqali buni bemalol tekshirish mumkin. Hozir quyidagicha ishlaydi kengaytma:

1. onBeforeRequest: domen olinadi URL’dan, keshdan tekshiriladi, agar keshda mavjud bo‘lsa, mos ikonka qo‘yiladi.
2. onResponseStarted: domen tekshiriladi keshda borligiga, bor bo‘lsa, chiqadi hodisadan (onBeforeRequest ichida tekshirilgan); yangi domen bo‘lsa, ushbu hodisada saytning IP manzili aniq, shu IP oraliqlarga tekshiriladi va mos ikonka qo‘yiladi.

Oraliqlar har oyda yangilanib turiladi Sarkor saytidan: http://tasix.sarkor.uz/full.

## Minnatdorliklar

Kengaytmaning yangi versiyasini yozishda quyidagi ochiq modul/kengaytmalarning kodi yordam berdi. Ularning mualliflariga minnatdorchiligimni bildiraman.

- https://github.com/whitequark/ipaddr.js
- https://github.com/keverw/range_check
- https://code.google.com/p/ipvfoo/

Server tarafidagi ozroq tuzatish uchun [swede2k](https://github.com/swede2k) uchun rahmat.

## Takliflar va talablar

Turli taklif va talablarni to‘g‘ridan-to‘g‘ri chinberdiyev@gmail.com pochtasiga jo‘natishingiz mumkin. Imkoni bo‘lsa, shu yerda alohida “issue” sifatida qoldirganingiz ma’qul: https://github.com/farhodjon/tasix-checker/issues