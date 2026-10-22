/* FAHIMA PORTES — langues (FR / AR / EN) et devises (DZD / EUR) */
(function () {
  // Taux de conversion utilisé pour afficher les prix en dinars.
  // Taux officiel Banque d'Algérie ≈ 151 DZD pour 1 € (octobre 2026). Modifiez cette valeur si besoin.
  var TAUX_EUR_DZD = 151;

  var T = {
    fr: {
      "meta.title": "FAHIMA PORTES | Fabricant de portes depuis 2019",
      "top.tagline": "Fabricant de portes depuis 2019",
      "top.lang": "Langue",
      "top.currency": "Devise",
      "flag.dz": "Algérie",
      "flag.tr": "Turquie",
      "nav.factory": "Notre usine",
      "nav.ranges": "Nos gammes",
      "nav.catalogue": "Voir le catalogue",
      "nav.account": "Mon compte",
      "nav.login": "Se connecter",
      "nav.home": "Accueil",
      "hero.kicker": "Fabricant de portes depuis 2019",
      "hero.title1": "L'élégance de la sécurité,",
      "hero.title2": "la force du prestige.",
      "hero.text": "Bienvenue chez FAHIMA PORTES. Dans notre usine, nous fabriquons des portes standard, des doubles portes, des portes coupe-feu certifiées et des gaines techniques, qui allient protection, finitions soignées et design contemporain.",
      "hero.cta": "Découvrir nos créations",
      "hero.more": "Notre histoire",
      "hero.badge": "portes livrées en 2025",
      "stats.title": "Une production en pleine croissance",
      "stats.s1.n": "2019",
      "stats.s1.t": "Début de la production",
      "stats.s2.t": "portes par an à nos débuts",
      "stats.s3.t": "portes livrées en 2025",
      "stats.s4.t": "portes par an : notre prochain objectif",
      "factory.kicker": "Notre usine",
      "factory.title": "De 3 000 à 30 000 portes par an.",
      "factory.intro": "Notre usine produit depuis 2019. Elle grandit chaque année pour livrer plus de portes, plus vite, sans rien céder sur la qualité.",
      "factory.t1.y": "2019",
      "factory.t1.h": "Le lancement",
      "factory.t1.p": "Notre usine commence la production avec une capacité d'environ 3 000 portes par an.",
      "factory.t2.y": "2025",
      "factory.t2.h": "12 000 portes livrées",
      "factory.t2.p": "Environ 12 000 portes livrées : portes standard, doubles portes, portes coupe-feu certifiées et gaines techniques.",
      "factory.t3.y": "Demain",
      "factory.t3.h": "Objectif 30 000 portes par an",
      "factory.t3.p": "Avec la fin de la modernisation de l'usine et l'installation de nouvelles machines à haute production, notre capacité atteindra environ 30 000 portes par an.",
      "ranges.kicker": "Nos gammes",
      "ranges.title": "Une porte pour chaque besoin.",
      "ranges.r1.h": "Portes standard",
      "ranges.r1.p": "Des portes robustes et élégantes pour les logements, les bureaux et les chantiers.",
      "ranges.r2.h": "Doubles portes",
      "ranges.r2.p": "Deux vantaux pour des entrées larges, prestigieuses et lumineuses.",
      "ranges.r3.h": "Portes coupe-feu",
      "ranges.r3.p": "Des portes certifiées qui limitent la propagation du feu et protègent les personnes.",
      "ranges.r3.tag": "Certifiées",
      "ranges.r4.h": "Gaines techniques",
      "ranges.r4.p": "Des trappes et portes de gaine pour habiller les réseaux techniques des bâtiments.",
      "values.v1.h": "Sécurité absolue",
      "values.v1.p": "Des structures renforcées pour protéger ce qui compte le plus.",
      "values.v2.h": "Design exclusif",
      "values.v2.p": "Des modèles raffinés pensés pour sublimer votre entrée.",
      "values.v3.h": "Finitions premium",
      "values.v3.p": "Des matériaux et des détails sélectionnés avec exigence.",
      "house.kicker": "L'excellence FAHIMA",
      "house.title": "Une entrée qui reflète votre personnalité.",
      "house.text": "Chaque porte FAHIMA est conçue comme une pièce maîtresse. Pour nous, une porte blindée ne doit pas seulement protéger votre maison : elle doit aussi exprimer votre goût, votre élégance et votre exigence.",
      "house.cta": "Explorer le catalogue",
      "account.cta.h": "Créez votre espace client",
      "account.cta.p": "Enregistrez vos coordonnées une seule fois pour demander vos devis plus rapidement.",
      "account.cta.b": "Créer un compte",
      "footer.text": "FAHIMA PORTES : l'élégance de la sécurité. Fabricant de portes depuis 2019.",
      "footer.rate": "Prix en dinars indicatifs, convertis au taux de 1 € = {rate} DA.",

      "nav.contact": "Contact",
      "gallery.kicker": "Nos réalisations",
      "gallery.title": "Une galerie de nos plus belles portes.",
      "gallery.text": "Chaque porte est fabriquée dans notre usine avec des matériaux sélectionnés et un contrôle qualité rigoureux.",
      "gallery.g1": "Modèle Géométrique",
      "gallery.g2": "Modèle Horizon",
      "gallery.g3": "Modèle Signature",
      "gallery.g4": "Modèle Double",
      "gallery.g5": "Modèle Contraste",
      "gallery.g6": "Modèle Prestige",
      "gallery.close": "Fermer",
      "gallery.open": "Agrandir",
      "testi.kicker": "Ils nous font confiance",
      "testi.title": "Ce que disent nos clients.",
      "testi.t1.t": "Une porte magnifique, solide et très bien finie. L'équipe FAHIMA a respecté les délais et le budget. Je recommande vivement.",
      "testi.t1.n": "Karim B.",
      "testi.t1.c": "Bordj Bou Arréridj",
      "testi.t2.t": "Nous avons équipé toute notre résidence de portes FAHIMA : qualité constante et service impeccable.",
      "testi.t2.n": "Établissement El Amine",
      "testi.t2.c": "Promoteur immobilier, Alger",
      "testi.t3.t": "Ma porte blindée est superbe, la finition effet bois est parfaite. Installation rapide et soignée.",
      "testi.t3.n": "Amina L.",
      "testi.t3.c": "Sétif",
      "contact.kicker": "Nous contacter",
      "contact.title": "Visitez notre usine ou écrivez-nous.",
      "contact.text": "Notre équipe vous conseille et vous établit un devis gratuit, sans engagement.",
      "contact.address.h": "Notre usine",
      "contact.address.v": "Usine FAHIMA PORTES, Khelil, Bordj Bou Arréridj, Algérie",
      "contact.phone.h": "Téléphone",
      "contact.whatsapp.h": "WhatsApp",
      "contact.whatsapp.b": "Écrire sur WhatsApp",
      "contact.email.h": "E-mail",
      "contact.hours.h": "Horaires",
      "contact.hours.v": "Samedi – Jeudi : 8h00 – 17h00",
      "contact.map": "Localisation de l'usine",
      "contact.wa.msg": "Bonjour FAHIMA PORTES, je souhaite des informations sur vos portes.",
      "form.sendwa": "Envoyer par WhatsApp",
      "form.or": "ou",

      "cat.title": "FAHIMA PORTES | Catalogue",
      "cat.kicker": "Collection 2026",
      "cat.h1a": "Le catalogue",
      "cat.intro": "Découvrez nos portes de caractère, conçues pour allier sécurité, raffinement et personnalité.",
      "cat.search": "Rechercher un modèle",
      "cat.search.ph": "Exemple : prestige, bois...",
      "cat.type": "Type de porte",
      "cat.min": "Prix minimum",
      "cat.max": "Prix maximum",
      "cat.all": "Toutes les portes",
      "type.blindee": "Porte blindée",
      "type.fer-forge": "Fer forgé",
      "type.simple": "Porte simple",
      "type.double": "Porte double",
      "type.chambre": "Porte de chambre",
      "type.sanitaire": "Porte sanitaire",
      "cat.none": "Aucun modèle ne correspond à votre recherche.",
      "cat.quote": "Demander un devis",
      "cat.from": "Prix indicatif",
      "cat.contact.h": "Une question ou un projet sur mesure ?",
      "cat.contact.call": "Appelez le",
      "cat.contact.or": "ou écrivez à",
      "form.h": "Demander un devis",
      "form.p": "Remplissez vos coordonnées. Votre logiciel de messagerie préparera automatiquement le message.",
      "form.model": "Modèle choisi",
      "form.name": "Nom et prénom *",
      "form.phone": "Téléphone *",
      "form.email": "Votre e-mail *",
      "form.address": "Adresse du projet",
      "form.msg": "Votre demande",
      "form.msg.ph": "Dimensions, installation, question...",
      "form.send": "Envoyer la demande par e-mail",
      "form.note": "Ensuite, cliquez sur « Envoyer » dans votre logiciel de messagerie.",
      "form.prefill": "Vos coordonnées ont été préremplies depuis votre compte.",

      "acc.title": "FAHIMA PORTES | Mon compte",
      "acc.h1": "Espace client",
      "acc.intro": "Connectez-vous ou créez votre compte pour suivre vos demandes de devis.",
      "acc.tab.login": "Se connecter",
      "acc.tab.signup": "Créer un compte",
      "acc.by.email": "E-mail",
      "acc.by.phone": "Téléphone",
      "acc.firstname": "Prénom",
      "acc.lastname": "Nom",
      "acc.email": "Adresse e-mail",
      "acc.phone": "Numéro de téléphone",
      "acc.password": "Mot de passe",
      "acc.password2": "Confirmer le mot de passe",
      "acc.pw.hint": "8 caractères minimum.",
      "acc.remember": "Rester connecté sur cet appareil",
      "acc.forgot": "Mot de passe oublié ?",
      "acc.btn.login": "Se connecter",
      "acc.btn.signup": "Créer mon compte",
      "acc.btn.sendcode": "Recevoir le code par SMS",
      "acc.code": "Code reçu par SMS",
      "acc.btn.verify": "Vérifier le code",
      "acc.code.sent": "Un code à 6 chiffres a été envoyé au {phone}.",
      "acc.email.sent": "Compte créé. Un e-mail de vérification a été envoyé à {email}. Cliquez sur le lien qu'il contient, puis revenez vous connecter.",
      "acc.reset.sent": "Un e-mail pour réinitialiser votre mot de passe a été envoyé à {email}.",
      "acc.reset.phone": "Saisissez votre numéro : nous vous enverrons un code par SMS, puis vous pourrez choisir un nouveau mot de passe.",
      "acc.newpw": "Nouveau mot de passe",
      "acc.btn.savepw": "Enregistrer le nouveau mot de passe",
      "acc.pw.saved": "Mot de passe modifié. Vous êtes connecté.",
      "acc.welcome": "Bonjour {name}",
      "acc.dash.p": "Bienvenue dans votre espace client FAHIMA PORTES.",
      "acc.dash.contact": "Contact",
      "acc.dash.status": "Statut",
      "acc.verified": "Vérifié",
      "acc.unverified": "En attente de vérification",
      "acc.resend": "Renvoyer l'e-mail de vérification",
      "acc.check": "J'ai vérifié mon e-mail",
      "acc.logout": "Se déconnecter",
      "acc.goto": "Voir le catalogue",
      "acc.back": "Retour",
      "acc.notready": "L'espace client est en cours d'activation. Il sera disponible très bientôt.",
      "err.generic": "Une erreur est survenue. Veuillez réessayer.",
      "err.pwmatch": "Les deux mots de passe ne correspondent pas.",
      "err.pwshort": "Le mot de passe doit contenir au moins 8 caractères.",
      "err.exists": "Un compte existe déjà avec cet identifiant. Connectez-vous.",
      "err.wrong": "Identifiant ou mot de passe incorrect.",
      "err.code": "Code incorrect ou expiré.",
      "err.phone": "Numéro de téléphone invalide.",
      "err.email": "Adresse e-mail invalide.",
      "err.many": "Trop de tentatives. Patientez quelques minutes.",
      "err.required": "Veuillez remplir tous les champs.",
      "err.notverified": "Votre e-mail n'est pas encore vérifié. Consultez votre boîte de réception."
    },

    ar: {
      "meta.title": "فهيمة للأبواب | مصنع أبواب منذ 2019",
      "top.tagline": "مصنع أبواب منذ 2019",
      "top.lang": "اللغة",
      "top.currency": "العملة",
      "flag.dz": "الجزائر",
      "flag.tr": "تركيا",
      "nav.factory": "مصنعنا",
      "nav.ranges": "منتجاتنا",
      "nav.catalogue": "تصفح الكتالوج",
      "nav.account": "حسابي",
      "nav.login": "تسجيل الدخول",
      "nav.home": "الرئيسية",
      "hero.kicker": "مصنع أبواب منذ 2019",
      "hero.title1": "أناقة الأمان،",
      "hero.title2": "وقوة الفخامة.",
      "hero.text": "مرحبًا بكم في فهيمة للأبواب. نصنع في مصنعنا الأبواب العادية والأبواب المزدوجة وأبواب مقاومة الحريق المعتمدة وأبواب الغرف التقنية، بحماية عالية وتشطيبات متقنة وتصميم عصري.",
      "hero.cta": "اكتشفوا تشكيلتنا",
      "hero.more": "قصتنا",
      "hero.badge": "باب تم تسليمه في 2025",
      "stats.title": "إنتاج في نمو متواصل",
      "stats.s1.n": "2019",
      "stats.s1.t": "بداية الإنتاج",
      "stats.s2.t": "باب سنويًا في البداية",
      "stats.s3.t": "باب تم تسليمه في 2025",
      "stats.s4.t": "باب سنويًا: هدفنا القادم",
      "factory.kicker": "مصنعنا",
      "factory.title": "من 3000 إلى 30000 باب سنويًا.",
      "factory.intro": "بدأ مصنعنا الإنتاج سنة 2019، ويكبر كل عام لنسلّم أبوابًا أكثر وبسرعة أكبر، دون التنازل عن الجودة.",
      "factory.t1.y": "2019",
      "factory.t1.h": "الانطلاقة",
      "factory.t1.p": "بدأ مصنعنا الإنتاج بطاقة تقارب 3000 باب سنويًا.",
      "factory.t2.y": "2025",
      "factory.t2.h": "12000 باب تم تسليمه",
      "factory.t2.p": "سلّمنا حوالي 12000 باب بين أبواب عادية وأبواب مزدوجة وأبواب مقاومة للحريق معتمدة وأبواب الغرف التقنية.",
      "factory.t3.y": "غدًا",
      "factory.t3.h": "الهدف: 30000 باب سنويًا",
      "factory.t3.p": "مع استكمال تحديث المصنع وتركيب آلات جديدة عالية الإنتاج، ستبلغ طاقتنا حوالي 30000 باب سنويًا.",
      "ranges.kicker": "منتجاتنا",
      "ranges.title": "باب لكل احتياج.",
      "ranges.r1.h": "أبواب عادية",
      "ranges.r1.p": "أبواب متينة وأنيقة للمساكن والمكاتب والمشاريع.",
      "ranges.r2.h": "أبواب مزدوجة",
      "ranges.r2.p": "مصراعان لمداخل واسعة وفخمة ومشرقة.",
      "ranges.r3.h": "أبواب مقاومة للحريق",
      "ranges.r3.p": "أبواب معتمدة تحد من انتشار النار وتحمي الأشخاص.",
      "ranges.r3.tag": "معتمدة",
      "ranges.r4.h": "أبواب الغرف التقنية",
      "ranges.r4.p": "فتحات وأبواب لتغطية الشبكات التقنية في المباني.",
      "values.v1.h": "أمان مطلق",
      "values.v1.p": "هياكل معززة لحماية أغلى ما لديكم.",
      "values.v2.h": "تصميم حصري",
      "values.v2.p": "تصاميم راقية تمنح مدخلكم لمسة مميزة.",
      "values.v3.h": "تشطيبات فاخرة",
      "values.v3.p": "مواد وتفاصيل مختارة بعناية فائقة.",
      "house.kicker": "تميّز فهيمة",
      "house.title": "مدخل يعكس شخصيتكم.",
      "house.text": "نصمم كل باب من فهيمة كقطعة فريدة. فالباب المصفح لا يحمي منزلكم فقط، بل يعبّر أيضًا عن ذوقكم وأناقتكم.",
      "house.cta": "تصفح الكتالوج",
      "account.cta.h": "أنشئوا حسابكم",
      "account.cta.p": "سجّلوا بياناتكم مرة واحدة لطلب عروض الأسعار بسرعة أكبر.",
      "account.cta.b": "إنشاء حساب",
      "footer.text": "فهيمة للأبواب: أناقة الأمان. مصنع أبواب منذ 2019.",
      "footer.rate": "الأسعار بالدينار تقريبية، محسوبة على أساس 1 يورو = {rate} دج.",

      "nav.contact": "اتصلوا بنا",
      "gallery.kicker": "إنجازاتنا",
      "gallery.title": "معرض من أجمل أبوابنا.",
      "gallery.text": "كل باب يُصنع في مصنعنا بمواد مختارة ومراقبة جودة دقيقة.",
      "gallery.g1": "النموذج الهندسي",
      "gallery.g2": "نموذج هورايزن",
      "gallery.g3": "نموذج سيغناتور",
      "gallery.g4": "النموذج المزدوج",
      "gallery.g5": "نموذج كونتراست",
      "gallery.g6": "نموذج بريستيج",
      "gallery.close": "إغلاق",
      "gallery.open": "تكبير",
      "testi.kicker": "يثقون بنا",
      "testi.title": "ماذا يقول زبائننا.",
      "testi.t1.t": "باب رائع، متين وبتشطيب ممتاز. احترم فريق فهيمة المواعيد والميزانية. أنصح بهم بقوة.",
      "testi.t1.n": "كريم ب.",
      "testi.t1.c": "برج بوعريريج",
      "testi.t2.t": "جهزنا كل مسكننا بأبواب فهيمة: جودة ثابتة وخدمة ممتازة.",
      "testi.t2.n": "مؤسسة الأمين",
      "testi.t2.c": "منعش عقاري، الجزائر",
      "testi.t3.t": "بابي المدرّع رائع والتشطيب بمظهر الخشب مثالي. تركيب سريع ومتقن.",
      "testi.t3.n": "أمينة ل.",
      "testi.t3.c": "سطيف",
      "contact.kicker": "اتصلوا بنا",
      "contact.title": "زوروا مصنعنا أو راسلونا.",
      "contact.text": "فريقنا ينصحكم ويعدّ لكم عرض سعر مجانيًا وبدون التزام.",
      "contact.address.h": "مصنعنا",
      "contact.address.v": "مصنع فهيمة للأبواب، خليل، برج بوعريريج، الجزائر",
      "contact.phone.h": "الهاتف",
      "contact.whatsapp.h": "واتساب",
      "contact.whatsapp.b": "راسلونا على واتساب",
      "contact.email.h": "البريد الإلكتروني",
      "contact.hours.h": "أوقات العمل",
      "contact.hours.v": "السبت – الخميس : 8:00 – 17:00",
      "contact.map": "موقع المصنع",
      "contact.wa.msg": "مرحبًا فهيمة للأبواب، أرغب في معلومات حول أبوابكم.",
      "form.sendwa": "إرسال عبر واتساب",
      "form.or": "أو",

      "cat.title": "فهيمة للأبواب | الكتالوج",
      "cat.kicker": "تشكيلة 2026",
      "cat.h1a": "كتالوج",
      "cat.intro": "اكتشفوا أبوابنا المميزة، المصممة لتجمع بين الأمان والرقي والشخصية.",
      "cat.search": "ابحث عن نموذج",
      "cat.search.ph": "مثال: بريستيج، خشب...",
      "cat.type": "نوع الباب",
      "cat.min": "أدنى سعر",
      "cat.max": "أعلى سعر",
      "cat.all": "كل الأبواب",
      "type.blindee": "باب مصفح",
      "type.fer-forge": "حديد مشغول",
      "type.simple": "باب فردي",
      "type.double": "باب مزدوج",
      "type.chambre": "باب غرفة",
      "type.sanitaire": "باب حمام",
      "cat.none": "لا يوجد نموذج يطابق بحثكم.",
      "cat.quote": "اطلب عرض سعر",
      "cat.from": "سعر تقريبي",
      "cat.contact.h": "لديكم سؤال أو مشروع حسب الطلب؟",
      "cat.contact.call": "اتصلوا على",
      "cat.contact.or": "أو راسلونا على",
      "form.h": "طلب عرض سعر",
      "form.p": "املؤوا بياناتكم، وسيجهّز برنامج البريد الرسالة تلقائيًا.",
      "form.model": "النموذج المختار",
      "form.name": "الاسم واللقب *",
      "form.phone": "الهاتف *",
      "form.email": "بريدكم الإلكتروني *",
      "form.address": "عنوان المشروع",
      "form.msg": "طلبكم",
      "form.msg.ph": "المقاسات، التركيب، سؤال...",
      "form.send": "إرسال الطلب عبر البريد",
      "form.note": "بعد ذلك، اضغطوا على «إرسال» في برنامج البريد.",
      "form.prefill": "تم ملء بياناتكم تلقائيًا من حسابكم.",

      "acc.title": "فهيمة للأبواب | حسابي",
      "acc.h1": "فضاء الزبائن",
      "acc.intro": "سجّلوا الدخول أو أنشئوا حسابًا لمتابعة طلبات عروض الأسعار.",
      "acc.tab.login": "تسجيل الدخول",
      "acc.tab.signup": "إنشاء حساب",
      "acc.by.email": "البريد الإلكتروني",
      "acc.by.phone": "الهاتف",
      "acc.firstname": "الاسم",
      "acc.lastname": "اللقب",
      "acc.email": "البريد الإلكتروني",
      "acc.phone": "رقم الهاتف",
      "acc.password": "كلمة المرور",
      "acc.password2": "تأكيد كلمة المرور",
      "acc.pw.hint": "8 أحرف على الأقل.",
      "acc.remember": "البقاء متصلًا على هذا الجهاز",
      "acc.forgot": "نسيت كلمة المرور؟",
      "acc.btn.login": "تسجيل الدخول",
      "acc.btn.signup": "إنشاء حسابي",
      "acc.btn.sendcode": "استلام الرمز عبر رسالة قصيرة",
      "acc.code": "الرمز المستلم",
      "acc.btn.verify": "تحقق من الرمز",
      "acc.code.sent": "تم إرسال رمز من 6 أرقام إلى {phone}.",
      "acc.email.sent": "تم إنشاء الحساب. أرسلنا رسالة تحقق إلى {email}. اضغطوا على الرابط الموجود فيها ثم عودوا لتسجيل الدخول.",
      "acc.reset.sent": "تم إرسال رسالة لإعادة تعيين كلمة المرور إلى {email}.",
      "acc.reset.phone": "أدخلوا رقمكم لنرسل لكم رمزًا عبر رسالة قصيرة، ثم اختاروا كلمة مرور جديدة.",
      "acc.newpw": "كلمة مرور جديدة",
      "acc.btn.savepw": "حفظ كلمة المرور الجديدة",
      "acc.pw.saved": "تم تغيير كلمة المرور. أنتم متصلون الآن.",
      "acc.welcome": "مرحبًا {name}",
      "acc.dash.p": "مرحبًا بكم في فضاء زبائن فهيمة للأبواب.",
      "acc.dash.contact": "معلومات الاتصال",
      "acc.dash.status": "الحالة",
      "acc.verified": "تم التحقق",
      "acc.unverified": "في انتظار التحقق",
      "acc.resend": "إعادة إرسال رسالة التحقق",
      "acc.check": "لقد تحققت من بريدي",
      "acc.logout": "تسجيل الخروج",
      "acc.goto": "تصفح الكتالوج",
      "acc.back": "رجوع",
      "acc.notready": "فضاء الزبائن قيد التفعيل وسيكون متاحًا قريبًا جدًا.",
      "err.generic": "حدث خطأ. يرجى المحاولة مرة أخرى.",
      "err.pwmatch": "كلمتا المرور غير متطابقتين.",
      "err.pwshort": "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.",
      "err.exists": "يوجد حساب بهذا المعرّف. سجّلوا الدخول.",
      "err.wrong": "المعرّف أو كلمة المرور غير صحيحة.",
      "err.code": "الرمز غير صحيح أو منتهي الصلاحية.",
      "err.phone": "رقم الهاتف غير صالح.",
      "err.email": "البريد الإلكتروني غير صالح.",
      "err.many": "محاولات كثيرة. يرجى الانتظار بضع دقائق.",
      "err.required": "يرجى ملء جميع الحقول.",
      "err.notverified": "لم يتم التحقق من بريدكم بعد. تفقدوا صندوق الوارد."
    },

    en: {
      "meta.title": "FAHIMA PORTES | Door manufacturer since 2019",
      "top.tagline": "Door manufacturer since 2019",
      "top.lang": "Language",
      "top.currency": "Currency",
      "flag.dz": "Algeria",
      "flag.tr": "Turkey",
      "nav.factory": "Our factory",
      "nav.ranges": "Our ranges",
      "nav.catalogue": "View catalogue",
      "nav.account": "My account",
      "nav.login": "Sign in",
      "nav.home": "Home",
      "hero.kicker": "Door manufacturer since 2019",
      "hero.title1": "The elegance of security,",
      "hero.title2": "the strength of prestige.",
      "hero.text": "Welcome to FAHIMA PORTES. In our factory we make standard doors, double doors, certified fire doors and service shaft doors, combining protection, fine finishes and contemporary design.",
      "hero.cta": "Discover our doors",
      "hero.more": "Our story",
      "hero.badge": "doors delivered in 2025",
      "stats.title": "Production that keeps growing",
      "stats.s1.n": "2019",
      "stats.s1.t": "Production starts",
      "stats.s2.t": "doors a year at launch",
      "stats.s3.t": "doors delivered in 2025",
      "stats.s4.t": "doors a year: our next goal",
      "factory.kicker": "Our factory",
      "factory.title": "From 3,000 to 30,000 doors a year.",
      "factory.intro": "Our factory has been producing since 2019. It grows every year so we can deliver more doors, faster, without compromising on quality.",
      "factory.t1.y": "2019",
      "factory.t1.h": "The launch",
      "factory.t1.p": "Our factory starts production with a capacity of around 3,000 doors a year.",
      "factory.t2.y": "2025",
      "factory.t2.h": "12,000 doors delivered",
      "factory.t2.p": "Around 12,000 doors delivered: standard doors, double doors, certified fire doors and service shaft doors.",
      "factory.t3.y": "Next",
      "factory.t3.h": "Target: 30,000 doors a year",
      "factory.t3.p": "Once the factory upgrades are complete and the new high-output machines are installed, our capacity will reach around 30,000 doors a year.",
      "ranges.kicker": "Our ranges",
      "ranges.title": "A door for every need.",
      "ranges.r1.h": "Standard doors",
      "ranges.r1.p": "Sturdy, elegant doors for homes, offices and building projects.",
      "ranges.r2.h": "Double doors",
      "ranges.r2.p": "Two leaves for wide, prestigious and bright entrances.",
      "ranges.r3.h": "Fire doors",
      "ranges.r3.p": "Certified doors that slow the spread of fire and protect people.",
      "ranges.r3.tag": "Certified",
      "ranges.r4.h": "Service shaft doors",
      "ranges.r4.p": "Access panels and shaft doors that conceal a building's technical networks.",
      "values.v1.h": "Absolute security",
      "values.v1.p": "Reinforced structures to protect what matters most.",
      "values.v2.h": "Exclusive design",
      "values.v2.p": "Refined models designed to enhance your entrance.",
      "values.v3.h": "Premium finishes",
      "values.v3.p": "Carefully selected materials and details.",
      "house.kicker": "FAHIMA excellence",
      "house.title": "An entrance that reflects who you are.",
      "house.text": "Every FAHIMA door is designed as a centrepiece. We believe a security door should not only protect your home: it should also express your taste, your elegance and your standards.",
      "house.cta": "Explore the catalogue",
      "account.cta.h": "Create your customer account",
      "account.cta.p": "Save your details once and request quotes faster.",
      "account.cta.b": "Create an account",
      "footer.text": "FAHIMA PORTES: the elegance of security. Door manufacturer since 2019.",
      "footer.rate": "Dinar prices are indicative, converted at €1 = DZD {rate}.",

      "nav.contact": "Contact",
      "gallery.kicker": "Our work",
      "gallery.title": "A gallery of our finest doors.",
      "gallery.text": "Every door is built in our factory with selected materials and strict quality control.",
      "gallery.g1": "Geometric model",
      "gallery.g2": "Horizon model",
      "gallery.g3": "Signature model",
      "gallery.g4": "Double model",
      "gallery.g5": "Contrast model",
      "gallery.g6": "Prestige model",
      "gallery.close": "Close",
      "gallery.open": "Enlarge",
      "testi.kicker": "Trusted by our clients",
      "testi.title": "What our clients say.",
      "testi.t1.t": "A magnificent door, solid and beautifully finished. The FAHIMA team met the deadline and the budget. Highly recommended.",
      "testi.t1.n": "Karim B.",
      "testi.t1.c": "Bordj Bou Arréridj",
      "testi.t2.t": "We fitted our whole residence with FAHIMA doors: consistent quality and impeccable service.",
      "testi.t2.n": "Etablissement El Amine",
      "testi.t2.c": "Property developer, Algiers",
      "testi.t3.t": "My armoured door is superb and the wood-effect finish is perfect. Fast, careful installation.",
      "testi.t3.n": "Amina L.",
      "testi.t3.c": "Sétif",
      "contact.kicker": "Contact us",
      "contact.title": "Visit our factory or write to us.",
      "contact.text": "Our team will advise you and prepare a free, no-obligation quote.",
      "contact.address.h": "Our factory",
      "contact.address.v": "FAHIMA PORTES factory, Khelil, Bordj Bou Arréridj, Algeria",
      "contact.phone.h": "Phone",
      "contact.whatsapp.h": "WhatsApp",
      "contact.whatsapp.b": "Message us on WhatsApp",
      "contact.email.h": "Email",
      "contact.hours.h": "Opening hours",
      "contact.hours.v": "Saturday – Thursday: 8:00 am – 5:00 pm",
      "contact.map": "Factory location",
      "contact.wa.msg": "Hello FAHIMA PORTES, I would like information about your doors.",
      "form.sendwa": "Send via WhatsApp",
      "form.or": "or",

      "cat.title": "FAHIMA PORTES | Catalogue",
      "cat.kicker": "2026 collection",
      "cat.h1a": "Catalogue",
      "cat.intro": "Discover our distinctive doors, designed to combine security, refinement and personality.",
      "cat.search": "Search for a model",
      "cat.search.ph": "E.g. prestige, wood...",
      "cat.type": "Door type",
      "cat.min": "Minimum price",
      "cat.max": "Maximum price",
      "cat.all": "All doors",
      "type.blindee": "Security door",
      "type.fer-forge": "Wrought iron",
      "type.simple": "Single door",
      "type.double": "Double door",
      "type.chambre": "Bedroom door",
      "type.sanitaire": "Bathroom door",
      "cat.none": "No model matches your search.",
      "cat.quote": "Request a quote",
      "cat.from": "Indicative price",
      "cat.contact.h": "A question or a custom project?",
      "cat.contact.call": "Call",
      "cat.contact.or": "or email",
      "form.h": "Request a quote",
      "form.p": "Fill in your details. Your email app will prepare the message automatically.",
      "form.model": "Selected model",
      "form.name": "Full name *",
      "form.phone": "Phone *",
      "form.email": "Your email *",
      "form.address": "Project address",
      "form.msg": "Your request",
      "form.msg.ph": "Dimensions, installation, question...",
      "form.send": "Send the request by email",
      "form.note": "Then click “Send” in your email app.",
      "form.prefill": "Your details were filled in from your account.",

      "acc.title": "FAHIMA PORTES | My account",
      "acc.h1": "Customer area",
      "acc.intro": "Sign in or create an account to follow your quote requests.",
      "acc.tab.login": "Sign in",
      "acc.tab.signup": "Create an account",
      "acc.by.email": "Email",
      "acc.by.phone": "Phone",
      "acc.firstname": "First name",
      "acc.lastname": "Last name",
      "acc.email": "Email address",
      "acc.phone": "Phone number",
      "acc.password": "Password",
      "acc.password2": "Confirm password",
      "acc.pw.hint": "At least 8 characters.",
      "acc.remember": "Stay signed in on this device",
      "acc.forgot": "Forgot your password?",
      "acc.btn.login": "Sign in",
      "acc.btn.signup": "Create my account",
      "acc.btn.sendcode": "Get the code by text message",
      "acc.code": "Code received by text",
      "acc.btn.verify": "Verify the code",
      "acc.code.sent": "A 6-digit code was sent to {phone}.",
      "acc.email.sent": "Account created. A verification email was sent to {email}. Click the link inside, then come back to sign in.",
      "acc.reset.sent": "A password reset email was sent to {email}.",
      "acc.reset.phone": "Enter your number: we will text you a code, then you can choose a new password.",
      "acc.newpw": "New password",
      "acc.btn.savepw": "Save new password",
      "acc.pw.saved": "Password changed. You are signed in.",
      "acc.welcome": "Hello {name}",
      "acc.dash.p": "Welcome to your FAHIMA PORTES customer area.",
      "acc.dash.contact": "Contact",
      "acc.dash.status": "Status",
      "acc.verified": "Verified",
      "acc.unverified": "Awaiting verification",
      "acc.resend": "Resend verification email",
      "acc.check": "I have verified my email",
      "acc.logout": "Sign out",
      "acc.goto": "View catalogue",
      "acc.back": "Back",
      "acc.notready": "The customer area is being activated and will be available very soon.",
      "err.generic": "Something went wrong. Please try again.",
      "err.pwmatch": "The passwords do not match.",
      "err.pwshort": "The password must be at least 8 characters long.",
      "err.exists": "An account already exists with this login. Please sign in.",
      "err.wrong": "Incorrect login or password.",
      "err.code": "Incorrect or expired code.",
      "err.phone": "Invalid phone number.",
      "err.email": "Invalid email address.",
      "err.many": "Too many attempts. Please wait a few minutes.",
      "err.required": "Please fill in all fields.",
      "err.notverified": "Your email is not verified yet. Please check your inbox."
    }
  };

  var MEM = {};
  var LANGS = ["fr", "ar", "en"];
  var LOCALES = { fr: "fr-FR", ar: "ar-DZ", en: "en-GB" };

  function lire(cle, defaut) {
    return MEM[cle] || defaut;
  }
  function ecrire(cle, val) {
    MEM[cle] = val;
  }

  function langueInitiale() {
    var url = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(url) > -1) return url;
    var saved = lire("fh-lang", null);
    if (LANGS.indexOf(saved) > -1) return saved;
    return "fr";
  }

  var etat = {
    lang: langueInitiale(),
    cur: lire("fh-cur", "DZD") === "EUR" ? "EUR" : "DZD"
  };

  function t(cle, vars) {
    var s = (T[etat.lang] && T[etat.lang][cle]) || T.fr[cle] || cle;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }

  function nombre(n, dec) {
    return new Intl.NumberFormat(LOCALES[etat.lang], {
      minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0
    }).format(n);
  }

  // Convertit un prix en euros vers la devise choisie (valeur numérique)
  function convertir(eur) {
    return etat.cur === "EUR" ? eur : Math.round((eur * TAUX_EUR_DZD) / 100) * 100;
  }
  function versEuro(val) {
    return etat.cur === "EUR" ? val : val / TAUX_EUR_DZD;
  }
  function symbole() {
    if (etat.cur === "EUR") return "€";
    return etat.lang === "ar" ? "دج" : "DA";
  }
  function prix(eur) {
    var v = convertir(eur);
    var txt = etat.cur === "EUR" ? nombre(v, 2) : nombre(v, 0);
    if (etat.lang === "en") return etat.cur === "EUR" ? "€" + txt : "DZD " + txt;
    return txt + " " + symbole();
  }

  function appliquer() {
    var html = document.documentElement;
    html.lang = etat.lang;
    html.dir = etat.lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (paire) {
        var p = paire.split(":");
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    var titre = document.querySelector("[data-i18n-title]");
    if (titre) document.title = t(titre.getAttribute("data-i18n-title"));

    document.querySelectorAll("[data-eur]").forEach(function (el) {
      el.textContent = prix(Number(el.getAttribute("data-eur")));
    });
    document.querySelectorAll("[data-num]").forEach(function (el) {
      el.textContent = nombre(Number(el.getAttribute("data-num")));
    });
    document.querySelectorAll("[data-rate]").forEach(function (el) {
      el.textContent = t("footer.rate", { rate: nombre(TAUX_EUR_DZD) });
      el.hidden = etat.cur !== "DZD";
    });

    // Liens WhatsApp : message prérempli dans la langue active
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var num = el.getAttribute("data-wa");
      el.setAttribute("href", "https://wa.me/" + num + "?text=" + encodeURIComponent(t("contact.wa.msg")));
    });

    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === etat.lang));
    });
    document.querySelectorAll("[data-cur]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-cur") === etat.cur));
    });

    // Nom du client connecté dans l'en-tête
    var user = null;
    try { user = JSON.parse(lire("fh-user", "null")); } catch (e) {}
    document.querySelectorAll("[data-account-label]").forEach(function (el) {
      el.textContent = user && user.prenom ? user.prenom : t("nav.login");
    });

    document.dispatchEvent(new CustomEvent("fh:change", { detail: { lang: etat.lang, cur: etat.cur } }));
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang],[data-cur]");
    if (!b) return;
    if (b.hasAttribute("data-lang")) { etat.lang = b.getAttribute("data-lang"); ecrire("fh-lang", etat.lang); }
    if (b.hasAttribute("data-cur")) { etat.cur = b.getAttribute("data-cur"); ecrire("fh-cur", etat.cur); }
    appliquer();
  });

  window.FH = {
    t: t, prix: prix, convertir: convertir, versEuro: versEuro, symbole: symbole, nombre: nombre,
    appliquer: appliquer, etat: etat, taux: TAUX_EUR_DZD,
    lire: lire, ecrire: ecrire
  };

  // Applique la langue au plus tôt pour éviter un clignotement
  document.documentElement.lang = etat.lang;
  document.documentElement.dir = etat.lang === "ar" ? "rtl" : "ltr";
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", appliquer);
  else appliquer();
})();
