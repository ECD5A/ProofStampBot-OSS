// Top 10 most common Telegram languages for global audiences.
export type Lang = 'ru' | 'en' | 'zh' | 'es' | 'pt' | 'de' | 'fr' | 'tr' | 'ar' | 'id' | 'hi';

type Params = Record<string, string | number>;

const EN: Record<string, string> = {
  choose_language: '🌐 <b>Choose language</b>',
  lang_changed: '✅ Language updated',

  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Digital cryptographic certification of documents on the TON blockchain.\n\n' +
    '📄 <b>How it works:</b>\n' +
    '1) Send any file\n' +
    '2) I calculate the SHA-256 fingerprint\n' +
    '3) Pay with ⭐ Stars or 🪙 TON\n' +
    '4) The fingerprint is recorded in TON\n' +
    '5) You receive a PDF certificate with QR\n\n' +
    '🔍 To check a document use /verify\n\n' +
    '💡 Commands:\n' +
    '/start - start\n' +
    '/verify - verify\n' +
    '/lang - language\n' +
    '/help - help\n' +
    '/cancel - reset current session',

  help:
    '📖 <b>How to use ProofStamp</b>\n\n' +
    '1) Send a file\n' +
    '2) Pay: ⭐ {starsPrice} Stars or 🪙 {tonPrice} TON\n' +
    '3) Receive a PDF certificate (with QR)\n\n' +
    'To verify later: send the same file again and use /verify.\n\n' +
    '🛡️ Your files are not saved. Only SHA-256 remains in the system.',

  verify_mode: '🔍 Send a file and I will check if it is recorded in TON.',
  computing_hash: '⏳ Processing...',
  doc_info: '📄 <b>File:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',

  choose_payment: 'Choose payment method:',
  btn_pay_stars: '⭐ Pay {starsPrice} Stars',
  btn_pay_ton: '💎 Pay {tonPrice} TON',
  btn_verify_payment: '✅ I paid - Verify',
  pay_ton_link: 'Send <b>{tonPrice} TON</b> using this link:\n{link}',

  verifying: '🔍 Checking TON blockchain...',
  payment_received: '✅ Payment confirmed. Generating certificate...',
  hash_recorded: '✅ <b>Recorded in TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ Not found in blockchain.',
  ton_payment_underpaid:
    '⚠️ Payment was found, but amount is below required <b>{tonPrice} TON</b>. ' +
    'Please send full amount and tap "I paid - Verify" again.',
  session_expired: '⏳ Session expired. Please send the file again.',
  error_processing: '❌ Error. Please try again.',
  no_doc_found: '❌ Could not read the file. Please send it as a document.',
  processing_in_progress: '⏳ Processing is already in progress. Please wait.',
  rate_limited: '⏳ Too many requests. Please wait a minute and try again.',
  file_too_large: '❌ File is too large. Maximum allowed: {maxMb} MB.',
  download_timeout: '❌ File download timed out. Please try again.',
  invalid_payment: '❌ Payment validation failed. Please create a new invoice and try again.',
  payment_already_processed: '✅ This payment has already been processed.',
  stars_already_paid: '✅ Stars payment already received.',
  stars_already_paid_help: 'Tap "I paid - Verify" to finish certificate processing.',
  invoice_already_created: 'Invoice is already created.',
  invoice_already_created_help: 'Open the last invoice message and complete payment there.',
  ton_rate_limited_retry: '⏳ TON network is busy (rate limit). Payment is saved. Please tap "I paid - Verify" in a few seconds.',
  channel_stamp_btn: 'Stamp this post',
  channel_stamp_ready: '🧾 ProofStamp is ready for this post. Chat admin can stamp it with one tap.',
  channel_stamp_admin_only: 'Only chat admins can stamp posts.',
  channel_stamp_not_found: 'Post context not found. Wait for a fresh post and try again.',
  channel_stamp_started: 'Stamping started...',
  channel_stamp_already_done: 'This post is already stamped.',
  channel_stamp_done: '✅ Post stamped and proof published.',
  channel_stamp_disabled: 'Channel stamp mode is disabled.',
  channel_stamp_group_only: 'Use /stamp in a group chat as a reply to the target message.',
  channel_stamp_usage_reply: 'Reply with /stamp to the target message, or add {tag} in admin post text.',
  channel_stamp_private_usage:
    'Forward a message/post from a group or channel here, then send /stamp (or reply /stamp to the forwarded message).',
  channel_stamp_payment_intro:
    '🧾 <b>Stamp post</b>\n' +
    'Chat: <b>{channelTitle}</b>\n' +
    'Post ID: <code>{postId}</code>\n\n' +
    'To publish proof under this post, pay:\n' +
    '⭐ {starsPrice} Stars or 💎 {tonPrice} TON.',
  channel_stamp_open_dm: 'Open bot private chat to continue payment.',
  channel_stamp_open_private_btn: 'Open bot',
  channel_stamp_open_private:
    'To stamp this post, open a private chat with the bot and press Start, then tap the stamp button again.',
  channel_stamp_open_private_fallback:
    'Open a private chat with the bot and press Start, then tap the stamp button again.',
  channel_stamp_open_private_alert: 'Open bot private chat first.',
  channel_stamp_send_failed: 'Could not place the stamp button in this chat. Check bot admin rights and topic permissions.',
  send_as_file: '📎 Please send the file as a document (not a photo).',
  send_file_hint: '📎 Send a file as a document to start notarization.',
  captcha_then_resend_file: '✅ Complete captcha, then send the file again as a document.',

  enter_owner_optional: '✍️ (Optional) Send owner/company name.',
  enter_owner_required: '✍️ Enter full name or organization (required for certificate).',
  owner_saved: '✅ Saved.',
  owner_skipped: '✅ Skipped.',
  owner_hint: '✍️ Send a name/company text, or tap Skip.',
  skip: 'Skip',
  or_skip: 'Or skip:',
  btn_cancel: 'Cancel',
  session_cleared: '🧹 Current session cleared.',

  invoice_title: 'ProofStamp Certificate',
  invoice_description: 'Blockchain proof of your document hash.',
  invoice_label: 'ProofStamp',

  certificate_caption: '📜 Your ProofStamp certificate\n<a href="{explorerUrl}">Open transaction</a>',
  verify_link_text: '🔗 Verification link:\n{link}',

  // CAPTCHA
  captcha_title: '🛡️ <b>Anti-spam check</b>',
  captcha_prompt: 'Select the <b>{color}</b> square:',
  captcha_success: '✅ Verified. You can use the bot now.',
  captcha_try_again: '❌ Wrong. Try again.',
  captcha_blocked: '🚫 Too many failed captcha attempts. Try again in {minutes} min.',
  color_red: 'red',
  color_green: 'green',
  color_blue: 'blue',
  color_yellow: 'yellow',

  // Certificate labels
  cert_title: 'PROOFSTAMP',
  cert_subtitle: 'Digital Certificate of Document Existence (TON blockchain)',
  cert_file: 'FILE',
  cert_owner: 'OWNER / COMPANY',
  cert_hash: 'SHA-256',
  cert_tx: 'TRANSACTION',
  cert_date: 'DATE (UTC)',
  cert_explorer: 'TON Explorer',
  cert_verify: 'Verification link',
  cert_footer:
    'This certificate confirms that the document fingerprint (SHA-256) was recorded in the TON blockchain. ' +
    'Verification is possible via the transaction link or by sending the original file to the bot.',
};

const RU: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Выберите язык</b>',
  lang_changed: '✅ Язык обновлен',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Сервис цифрового криптографического заверения документов в блокчейне TON.\n\n' +
    '📄 <b>Как это работает:</b>\n' +
    '1) Отправьте любой файл\n' +
    '2) Бот вычислит SHA-256 отпечаток\n' +
    '3) Оплатите ⭐ Stars или 💎 TON\n' +
    '4) Отпечаток будет записан в TON\n' +
    '5) Вы получите PDF-сертификат с QR\n\n' +
    '🔍 Для проверки используйте /verify\n\n' +
    '💡 Команды:\n' +
    '/start - старт\n' +
    '/verify - проверка\n' +
    '/lang - язык\n' +
    '/help - помощь\n' +
    '/cancel - сбросить текущую сессию',
  help:
    '📖 <b>Как пользоваться ProofStamp</b>\n\n' +
    '1) Отправьте файл\n' +
    '2) Оплата: ⭐ {starsPrice} Stars или 💎 {tonPrice} TON\n' +
    '3) Получите PDF-сертификат (с QR)\n\n' +
    'Для проверки позже отправьте тот же файл и используйте /verify.\n\n' +
    '🛡️ Ваши файлы не сохраняются. В системе остается только SHA-256.',
  verify_mode: '🔍 Отправьте файл, и я проверю, записан ли он в TON.',
  computing_hash: '⏳ Обрабатываю...',
  doc_info: '📄 <b>Файл:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Выберите способ оплаты:',
  btn_pay_stars: '⭐ Оплатить {starsPrice} Stars',
  btn_pay_ton: '💎 Оплатить {tonPrice} TON',
  btn_verify_payment: '✅ Я оплатил - Проверить',
  pay_ton_link: 'Отправьте <b>{tonPrice} TON</b> по ссылке:\n{link}',
  verifying: '🔍 Проверяю в блокчейне TON...',
  payment_received: '✅ Платеж подтвержден. Формирую сертификат...',
  hash_recorded: '✅ <b>Записано в TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ В блокчейне не найдено.',
  ton_payment_underpaid:
    '⚠️ Платеж найден, но сумма меньше требуемых <b>{tonPrice} TON</b>. ' +
    'Отправьте полную сумму и нажмите «Я оплатил - Проверить» еще раз.',
  session_expired: '⏳ Сессия истекла. Отправьте файл снова.',
  error_processing: '❌ Ошибка. Попробуйте еще раз.',
  no_doc_found: '❌ Не удалось прочитать файл. Отправьте как документ.',
  processing_in_progress: '⏳ Обработка уже идет. Подождите, пожалуйста.',
  rate_limited: '⏳ Слишком много запросов. Подождите минуту и попробуйте снова.',
  file_too_large: '❌ Файл слишком большой. Максимум: {maxMb} MB.',
  download_timeout: '❌ Не удалось скачать файл вовремя. Попробуйте еще раз.',
  invalid_payment: '❌ Платеж не прошел проверку. Сформируйте новый инвойс и повторите.',
  payment_already_processed: '✅ Этот платеж уже обработан.',
  stars_already_paid: '✅ Оплата Stars уже получена.',
  stars_already_paid_help: 'Нажмите «Я оплатил - Проверить», чтобы завершить выпуск сертификата.',
  invoice_already_created: 'Инвойс уже создан.',
  invoice_already_created_help: 'Откройте последнее сообщение с инвойсом и завершите оплату там.',
  ton_rate_limited_retry: '⏳ TON сеть перегружена (лимит API). Оплата сохранена. Нажмите «Я оплатил - Проверить» через несколько секунд.',
  channel_stamp_btn: 'Зафиксировать пост',
  channel_stamp_ready: '🧾 ProofStamp готов для этого поста. Админ чата может зафиксировать его в один тап.',
  channel_stamp_admin_only: 'Только админы чата могут фиксировать посты.',
  channel_stamp_not_found: 'Контекст поста не найден. Дождитесь нового поста и попробуйте снова.',
  channel_stamp_started: 'Фиксация запущена...',
  channel_stamp_already_done: 'Этот пост уже зафиксирован.',
  channel_stamp_done: '✅ Пост зафиксирован, proof опубликован.',
  channel_stamp_disabled: 'Режим штампа канала отключен.',
  channel_stamp_group_only: 'Используйте /stamp в группе ответом на нужное сообщение.',
  channel_stamp_usage_reply: 'Ответьте /stamp на нужное сообщение или добавьте {tag} в текст поста от админа.',
  channel_stamp_private_usage:
    'Перешлите сюда сообщение/пост из группы или канала, затем отправьте /stamp (или ответьте /stamp на пересланное сообщение).',
  channel_stamp_payment_intro:
    '🧾 <b>Фиксация поста</b>\n' +
    'Чат: <b>{channelTitle}</b>\n' +
    'Пост ID: <code>{postId}</code>\n\n' +
    'Чтобы опубликовать proof под этим постом, оплатите:\n' +
    '⭐ {starsPrice} Stars или 💎 {tonPrice} TON.',
  channel_stamp_open_dm: 'Откройте личный чат с ботом для оплаты.',
  channel_stamp_open_private_btn: 'Открыть бота',
  channel_stamp_open_private:
    'Чтобы зафиксировать пост, откройте личный чат с ботом и нажмите Start, затем нажмите кнопку фиксации снова.',
  channel_stamp_open_private_fallback:
    'Откройте личный чат с ботом и нажмите Start, затем нажмите кнопку фиксации снова.',
  channel_stamp_open_private_alert: 'Сначала откройте личный чат с ботом.',
  channel_stamp_send_failed: 'Не удалось поставить кнопку фиксации в этом чате. Проверьте права бота и права в теме.',
  send_as_file: '📎 Отправьте файл как документ (не фото).',
  send_file_hint: '📎 Отправьте файл как документ, чтобы начать фиксацию.',
  captcha_then_resend_file: '✅ Пройдите капчу и отправьте файл как документ еще раз.',
  enter_owner_optional: '✍️ (Опционально) Введите ФИО или организацию для сертификата.',
  enter_owner_required: '✍️ Введите ФИО или организацию (обязательно для сертификата).',
  owner_saved: '✅ Сохранено.',
  owner_skipped: '✅ Пропущено.',
  owner_hint: '✍️ Отправьте ФИО/название компании или нажмите «Пропустить».',
  skip: 'Пропустить',
  or_skip: 'Или пропустите:',
  btn_cancel: 'Отмена',
  session_cleared: '🧹 Текущая сессия очищена.',
  captcha_title: '🛡️ <b>Антиспам-проверка</b>',
  captcha_prompt: 'Выберите квадрат <b>{color}</b>:',
  captcha_success: '✅ Проверка пройдена. Теперь можно пользоваться ботом.',
  captcha_try_again: '❌ Неверно. Попробуйте еще раз.',
  captcha_blocked: '🚫 Слишком много неверных попыток капчи. Попробуйте снова через {minutes} мин.',
  color_red: 'красный',
  color_green: 'зеленый',
  color_blue: 'синий',
  color_yellow: 'желтый',
  invoice_title: 'Сертификат ProofStamp',
  invoice_description: 'Блокчейн-подтверждение хэша документа.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Ссылка для проверки:\n{link}',
  cert_subtitle: 'Цифровой сертификат существования документа (TON)',
  cert_file: 'ФАЙЛ',
  cert_owner: 'ВЛАДЕЛЕЦ / ОРГАНИЗАЦИЯ',
  cert_tx: 'ТРАНЗАКЦИЯ',
  cert_date: 'ДАТА (UTC)',
  cert_verify: 'Ссылка проверки',
  cert_footer:
    'Этот сертификат подтверждает, что SHA-256 отпечаток документа был записан в блокчейн TON. ' +
    'Проверка возможна по ссылке транзакции или через повторную отправку файла боту.',
};

const ES: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Elige idioma</b>',
  lang_changed: '✅ Idioma actualizado',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Certificación criptográfica digital de documentos en la blockchain TON.\n\n' +
    '📄 <b>Cómo funciona:</b>\n' +
    '1) Envía cualquier archivo\n' +
    '2) Calculo la huella SHA-256\n' +
    '3) Paga con ⭐ Stars o 🪙 TON\n' +
    '4) La huella se registra en TON\n' +
    '5) Recibes un certificado PDF con QR\n\n' +
    '🔍 Para verificar un documento usa /verify\n\n' +
    '💡 Comandos:\n' +
    '/start - iniciar\n' +
    '/verify - verificar\n' +
    '/lang - idioma\n' +
    '/help - ayuda',
  help:
    '📖 <b>Cómo usar ProofStamp</b>\n\n' +
    '1) Envía un archivo\n' +
    '2) Pago: ⭐ {starsPrice} Stars o 🪙 {tonPrice} TON\n' +
    '3) Recibe un certificado PDF (con QR)\n\n' +
    'Para verificar después: envía el mismo archivo y usa /verify.\n\n' +
    '🛡️ Tus archivos no se guardan. En el sistema solo queda SHA-256.',
  verify_mode: '🔍 <b>Modo verificación</b>\nEnvía un archivo y comprobaré si está registrado en TON.',
  computing_hash: '⏳ Procesando...',
  doc_info: '📄 <b>Archivo:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Elige método de pago:',
  btn_pay_stars: '⭐ Pagar {starsPrice} Stars',
  btn_pay_ton: '💎 Pagar {tonPrice} TON',
  btn_verify_payment: '✅ Ya pagué - Verificar',
  pay_ton_link: 'Envía <b>{tonPrice} TON</b> usando este enlace:\n{link}',
  verifying: '🔍 Comprobando en TON...',
  payment_received: '✅ Pago confirmado. Generando certificado...',
  hash_recorded: '✅ <b>Registrado en TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ No encontrado en la blockchain.',
  session_expired: '⏳ Sesión expirada. Envía el archivo de nuevo.',
  error_processing: '❌ Error. Inténtalo otra vez.',
  no_doc_found: '❌ No se pudo leer el archivo. Envíalo como documento.',
  send_as_file: '📎 Envía el archivo como documento (no como foto).',
  invoice_title: 'Certificado ProofStamp',
  invoice_description: 'Prueba en blockchain del hash de tu documento.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Enlace de verificación:\n{link}',
  cert_subtitle: 'Certificado digital de existencia del documento (blockchain TON)',
  cert_file: 'ARCHIVO',
  cert_owner: 'PROPIETARIO / EMPRESA',
  cert_tx: 'TRANSACCIÓN',
  cert_date: 'FECHA (UTC)',
  cert_explorer: 'Explorador TON',
  cert_verify: 'Enlace de verificación',
  cert_footer:
    'Este certificado confirma que la huella digital (SHA-256) del documento fue registrada en la blockchain TON. ' +
    'La verificación es posible mediante el enlace de transacción o enviando el archivo original al bot.',
};

const PT: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Escolha o idioma</b>',
  lang_changed: '✅ Idioma atualizado',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Certificação criptográfica digital de documentos na blockchain TON.\n\n' +
    '📄 <b>Como funciona:</b>\n' +
    '1) Envie qualquer arquivo\n' +
    '2) Eu calculo a impressão SHA-256\n' +
    '3) Pague com ⭐ Stars ou 🪙 TON\n' +
    '4) A impressão é registrada na TON\n' +
    '5) Você recebe um certificado PDF com QR\n\n' +
    '🔍 Para verificar um documento use /verify\n\n' +
    '💡 Comandos:\n' +
    '/start - iniciar\n' +
    '/verify - verificar\n' +
    '/lang - idioma\n' +
    '/help - ajuda',
  help:
    '📖 <b>Como usar o ProofStamp</b>\n\n' +
    '1) Envie um arquivo\n' +
    '2) Pagamento: ⭐ {starsPrice} Stars ou 🪙 {tonPrice} TON\n' +
    '3) Receba um certificado PDF (com QR)\n\n' +
    'Para verificar depois: envie o mesmo arquivo e use /verify.\n\n' +
    '🛡️ Seus arquivos não são salvos. No sistema fica apenas o SHA-256.',
  verify_mode: '🔍 <b>Modo de verificação</b>\nEnvie um arquivo e eu verificarei se ele está registrado na TON.',
  computing_hash: '⏳ Processando...',
  doc_info: '📄 <b>Arquivo:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Escolha o método de pagamento:',
  btn_pay_stars: '⭐ Pagar {starsPrice} Stars',
  btn_pay_ton: '💎 Pagar {tonPrice} TON',
  btn_verify_payment: '✅ Já paguei - Verificar',
  pay_ton_link: 'Envie <b>{tonPrice} TON</b> usando este link:\n{link}',
  verifying: '🔍 Verificando na TON...',
  payment_received: '✅ Pagamento confirmado. Gerando certificado...',
  hash_recorded: '✅ <b>Registrado na TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ Não encontrado na blockchain.',
  session_expired: '⏳ Sessão expirada. Envie o arquivo novamente.',
  error_processing: '❌ Erro. Tente novamente.',
  no_doc_found: '❌ Não foi possível ler o arquivo. Envie como documento.',
  send_as_file: '📎 Envie o arquivo como documento (não como foto).',
  invoice_title: 'Certificado ProofStamp',
  invoice_description: 'Prova em blockchain do hash do seu documento.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Link de verificação:\n{link}',
  cert_subtitle: 'Certificado digital de existência do documento (blockchain TON)',
  cert_file: 'ARQUIVO',
  cert_owner: 'PROPRIETÁRIO / EMPRESA',
  cert_tx: 'TRANSAÇÃO',
  cert_date: 'DATA (UTC)',
  cert_explorer: 'Explorador TON',
  cert_verify: 'Link de verificação',
  cert_footer:
    'Este certificado confirma que a impressão digital (SHA-256) do documento foi registrada na blockchain TON. ' +
    'A verificação é possível pelo link da transação ou enviando o arquivo original ao bot.',
};

const DE: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Sprache wählen</b>',
  lang_changed: '✅ Sprache aktualisiert',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Digitale kryptografische Zertifizierung von Dokumenten in der TON-Blockchain.\n\n' +
    '📄 <b>So funktioniert es:</b>\n' +
    '1) Sende eine Datei\n' +
    '2) Ich berechne den SHA-256-Fingerabdruck\n' +
    '3) Bezahle mit ⭐ Stars oder 🪙 TON\n' +
    '4) Der Fingerabdruck wird in TON gespeichert\n' +
    '5) Du erhältst ein PDF-Zertifikat mit QR\n\n' +
    '🔍 Zum Prüfen eines Dokuments nutze /verify\n\n' +
    '💡 Befehle:\n' +
    '/start - starten\n' +
    '/verify - prüfen\n' +
    '/lang - sprache\n' +
    '/help - hilfe',
  help:
    '📖 <b>So nutzt du ProofStamp</b>\n\n' +
    '1) Sende eine Datei\n' +
    '2) Zahlung: ⭐ {starsPrice} Stars oder 🪙 {tonPrice} TON\n' +
    '3) Erhalte ein PDF-Zertifikat (mit QR)\n\n' +
    'Zum späteren Prüfen: sende dieselbe Datei erneut und nutze /verify.\n\n' +
    '🛡️ Ihre Dateien werden nicht gespeichert. Im System bleibt nur SHA-256.',
  verify_mode: '🔍 <b>Prüfmodus</b>\nSende eine Datei und ich prüfe, ob sie in TON gespeichert ist.',
  computing_hash: '⏳ Verarbeitung...',
  doc_info: '📄 <b>Datei:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Wähle eine Zahlungsmethode:',
  btn_pay_stars: '⭐ {starsPrice} Stars bezahlen',
  btn_pay_ton: '💎 {tonPrice} TON bezahlen',
  btn_verify_payment: '✅ Ich habe bezahlt - Prüfen',
  pay_ton_link: 'Sende <b>{tonPrice} TON</b> über diesen Link:\n{link}',
  verifying: '🔍 Prüfung in TON läuft...',
  payment_received: '✅ Zahlung bestätigt. Zertifikat wird erstellt...',
  hash_recorded: '✅ <b>In TON gespeichert</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ In der Blockchain nicht gefunden.',
  session_expired: '⏳ Sitzung abgelaufen. Bitte sende die Datei erneut.',
  error_processing: '❌ Fehler. Bitte erneut versuchen.',
  no_doc_found: '❌ Datei konnte nicht gelesen werden. Bitte als Dokument senden.',
  send_as_file: '📎 Bitte sende die Datei als Dokument (nicht als Foto).',
  invoice_title: 'ProofStamp-Zertifikat',
  invoice_description: 'Blockchain-Nachweis für den Hash deines Dokuments.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Verifizierungslink:\n{link}',
  cert_subtitle: 'Digitales Zertifikat über die Existenz eines Dokuments (TON-Blockchain)',
  cert_file: 'DATEI',
  cert_owner: 'INHABER / UNTERNEHMEN',
  cert_tx: 'TRANSAKTION',
  cert_date: 'DATUM (UTC)',
  cert_explorer: 'TON Explorer',
  cert_verify: 'Verifizierungslink',
  cert_footer:
    'Dieses Zertifikat bestätigt, dass der Dokument-Fingerabdruck (SHA-256) in der TON-Blockchain gespeichert wurde. ' +
    'Eine Verifizierung ist über den Transaktionslink oder durch erneutes Senden der Originaldatei an den Bot möglich.',
};

const FR: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Choisir la langue</b>',
  lang_changed: '✅ Langue mise à jour',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Certification cryptographique numérique de documents sur la blockchain TON.\n\n' +
    '📄 <b>Comment ça marche :</b>\n' +
    '1) Envoyez un fichier\n' +
    '2) Je calcule l’empreinte SHA-256\n' +
    '3) Payez en ⭐ Stars ou 🪙 TON\n' +
    '4) L’empreinte est enregistrée dans TON\n' +
    '5) Vous recevez un certificat PDF avec QR\n\n' +
    '🔍 Pour vérifier un document, utilisez /verify\n\n' +
    '💡 Commandes :\n' +
    '/start - démarrer\n' +
    '/verify - vérifier\n' +
    '/lang - langue\n' +
    '/help - aide',
  help:
    '📖 <b>Comment utiliser ProofStamp</b>\n\n' +
    '1) Envoyez un fichier\n' +
    '2) Paiement : ⭐ {starsPrice} Stars ou 🪙 {tonPrice} TON\n' +
    '3) Recevez un certificat PDF (avec QR)\n\n' +
    'Pour vérifier plus tard : renvoyez le même fichier et utilisez /verify.\n\n' +
    '🛡️ Vos fichiers ne sont pas enregistrés. Seul SHA-256 reste dans le système.',
  verify_mode: '🔍 <b>Mode vérification</b>\nEnvoyez un fichier et je vérifierai s’il est enregistré dans TON.',
  computing_hash: '⏳ Traitement en cours...',
  doc_info: '📄 <b>Fichier :</b> {fileName}\n🔑 <b>SHA-256 :</b>\n<code>{hash}</code>',
  choose_payment: 'Choisissez le mode de paiement :',
  btn_pay_stars: '⭐ Payer {starsPrice} Stars',
  btn_pay_ton: '💎 Payer {tonPrice} TON',
  btn_verify_payment: '✅ Paiement effectué - Vérifier',
  pay_ton_link: 'Envoyez <b>{tonPrice} TON</b> avec ce lien :\n{link}',
  verifying: '🔍 Vérification sur TON...',
  payment_received: '✅ Paiement confirmé. Génération du certificat...',
  hash_recorded: '✅ <b>Enregistré dans TON</b>\nTX : <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ Introuvable sur la blockchain.',
  session_expired: '⏳ Session expirée. Veuillez renvoyer le fichier.',
  error_processing: '❌ Erreur. Veuillez réessayer.',
  no_doc_found: '❌ Impossible de lire le fichier. Envoyez-le comme document.',
  send_as_file: '📎 Veuillez envoyer le fichier comme document (pas comme photo).',
  invoice_title: 'Certificat ProofStamp',
  invoice_description: 'Preuve blockchain du hash de votre document.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Lien de vérification :\n{link}',
  cert_subtitle: 'Certificat numérique d’existence de document (blockchain TON)',
  cert_file: 'FICHIER',
  cert_owner: 'PROPRIÉTAIRE / ENTREPRISE',
  cert_tx: 'TRANSACTION',
  cert_date: 'DATE (UTC)',
  cert_explorer: 'Explorateur TON',
  cert_verify: 'Lien de vérification',
  cert_footer:
    'Ce certificat confirme que l’empreinte du document (SHA-256) a été enregistrée dans la blockchain TON. ' +
    'La vérification est possible via le lien de transaction ou en renvoyant le fichier original au bot.',
};

const TR: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Dil seç</b>',
  lang_changed: '✅ Dil güncellendi',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Belgelerin TON blokzincirinde dijital kriptografik sertifikalanması.\n\n' +
    '📄 <b>Nasıl çalışır:</b>\n' +
    '1) Herhangi bir dosya gönderin\n' +
    '2) SHA-256 parmak izini hesaplarım\n' +
    '3) ⭐ Stars veya 🪙 TON ile ödeme yapın\n' +
    '4) Parmak izi TON’a kaydedilir\n' +
    '5) QR kodlu PDF sertifika alırsınız\n\n' +
    '🔍 Belgeyi kontrol etmek için /verify kullanın\n\n' +
    '💡 Komutlar:\n' +
    '/start - başlat\n' +
    '/verify - doğrula\n' +
    '/lang - dil\n' +
    '/help - yardım',
  help:
    '📖 <b>ProofStamp nasıl kullanılır</b>\n\n' +
    '1) Bir dosya gönderin\n' +
    '2) Ödeme: ⭐ {starsPrice} Stars veya 🪙 {tonPrice} TON\n' +
    '3) PDF sertifika alın (QR ile)\n\n' +
    'Daha sonra doğrulamak için aynı dosyayı tekrar gönderin ve /verify kullanın.\n\n' +
    '🛡️ Dosyalarınız kaydedilmez. Sistemde yalnızca SHA-256 kalır.',
  verify_mode: '🔍 <b>Doğrulama modu</b>\nBir dosya gönderin, TON’da kayıtlı mı kontrol edeyim.',
  computing_hash: '⏳ İşleniyor...',
  doc_info: '📄 <b>Dosya:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Ödeme yöntemini seçin:',
  btn_pay_stars: '⭐ {starsPrice} Stars öde',
  btn_pay_ton: '💎 {tonPrice} TON öde',
  btn_verify_payment: '✅ Ödedim - Doğrula',
  pay_ton_link: '<b>{tonPrice} TON</b> göndermek için bu bağlantıyı kullanın:\n{link}',
  verifying: '🔍 TON üzerinde kontrol ediliyor...',
  payment_received: '✅ Ödeme onaylandı. Sertifika oluşturuluyor...',
  hash_recorded: '✅ <b>TON’a kaydedildi</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ Blokzincirde bulunamadı.',
  session_expired: '⏳ Oturum süresi doldu. Lütfen dosyayı tekrar gönderin.',
  error_processing: '❌ Hata. Lütfen tekrar deneyin.',
  no_doc_found: '❌ Dosya okunamadı. Lütfen belge olarak gönderin.',
  send_as_file: '📎 Lütfen dosyayı belge olarak gönderin (fotoğraf değil).',
  invoice_title: 'ProofStamp Sertifikası',
  invoice_description: 'Belgenizin hash değeri için blokzincir kanıtı.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Doğrulama bağlantısı:\n{link}',
  cert_subtitle: 'Belge varlığı için dijital sertifika (TON blokzinciri)',
  cert_file: 'DOSYA',
  cert_owner: 'SAHİP / ŞİRKET',
  cert_tx: 'İŞLEM',
  cert_date: 'TARİH (UTC)',
  cert_explorer: 'TON Gezgini',
  cert_verify: 'Doğrulama bağlantısı',
  cert_footer:
    'Bu sertifika, belge parmak izinin (SHA-256) TON blokzincirine kaydedildiğini doğrular. ' +
    'Doğrulama işlem bağlantısıyla veya orijinal dosyayı tekrar bota göndererek yapılabilir.',
};

const AR: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>اختر اللغة</b>',
  lang_changed: '✅ تم تحديث اللغة',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'توثيق رقمي مشفر للمستندات على بلوكتشين TON.\n\n' +
    '📄 <b>كيف يعمل:</b>\n' +
    '1) أرسل أي ملف\n' +
    '2) أحسب بصمة SHA-256\n' +
    '3) ادفع عبر ⭐ Stars أو 🪙 TON\n' +
    '4) تُسجل البصمة في TON\n' +
    '5) تستلم شهادة PDF مع رمز QR\n\n' +
    '🔍 للتحقق من مستند استخدم /verify\n\n' +
    '💡 الأوامر:\n' +
    '/start - بدء\n' +
    '/verify - تحقق\n' +
    '/lang - اللغة\n' +
    '/help - مساعدة',
  help:
    '📖 <b>كيفية استخدام ProofStamp</b>\n\n' +
    '1) أرسل ملفًا\n' +
    '2) الدفع: ⭐ {starsPrice} Stars أو 🪙 {tonPrice} TON\n' +
    '3) استلم شهادة PDF (مع QR)\n\n' +
    'للتحقق لاحقًا: أرسل نفس الملف مرة أخرى واستخدم /verify.\n\n' +
    '🛡️ لا يتم حفظ ملفاتك. يبقى في النظام فقط SHA-256.',
  verify_mode: '🔍 <b>وضع التحقق</b>\nأرسل ملفًا وسأتحقق إن كان مسجلًا في TON.',
  computing_hash: '⏳ جاري المعالجة...',
  doc_info: '📄 <b>الملف:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'اختر طريقة الدفع:',
  btn_pay_stars: '⭐ ادفع {starsPrice} Stars',
  btn_pay_ton: '💎 ادفع {tonPrice} TON',
  btn_verify_payment: '✅ دفعت - تحقق',
  pay_ton_link: 'أرسل <b>{tonPrice} TON</b> عبر هذا الرابط:\n{link}',
  verifying: '🔍 جاري التحقق على TON...',
  payment_received: '✅ تم تأكيد الدفع. جارٍ إنشاء الشهادة...',
  hash_recorded: '✅ <b>تم التسجيل في TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ غير موجود على البلوكتشين.',
  session_expired: '⏳ انتهت الجلسة. يرجى إرسال الملف مرة أخرى.',
  error_processing: '❌ حدث خطأ. حاول مرة أخرى.',
  no_doc_found: '❌ تعذر قراءة الملف. أرسله كوثيقة.',
  send_as_file: '📎 يرجى إرسال الملف كوثيقة (وليس كصورة).',
  invoice_title: 'شهادة ProofStamp',
  invoice_description: 'إثبات بلوكتشين لبصمة ملفك.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 رابط التحقق:\n{link}',
  cert_subtitle: 'شهادة رقمية لإثبات وجود المستند (بلوكتشين TON)',
  cert_file: 'الملف',
  cert_owner: 'المالك / الشركة',
  cert_tx: 'المعاملة',
  cert_date: 'التاريخ (UTC)',
  cert_explorer: 'مستعرض TON',
  cert_verify: 'رابط التحقق',
  cert_footer:
    'تؤكد هذه الشهادة أن بصمة المستند (SHA-256) تم تسجيلها على بلوكتشين TON. ' +
    'يمكن التحقق عبر رابط المعاملة أو بإرسال الملف الأصلي إلى البوت مرة أخرى.',
};

const ID: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>Pilih bahasa</b>',
  lang_changed: '✅ Bahasa diperbarui',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Sertifikasi kriptografi digital untuk dokumen di blockchain TON.\n\n' +
    '📄 <b>Cara kerja:</b>\n' +
    '1) Kirim file apa saja\n' +
    '2) Saya hitung sidik SHA-256\n' +
    '3) Bayar dengan ⭐ Stars atau 🪙 TON\n' +
    '4) Sidik disimpan di TON\n' +
    '5) Anda menerima sertifikat PDF dengan QR\n\n' +
    '🔍 Untuk cek dokumen gunakan /verify\n\n' +
    '💡 Perintah:\n' +
    '/start - mulai\n' +
    '/verify - verifikasi\n' +
    '/lang - bahasa\n' +
    '/help - bantuan',
  help:
    '📖 <b>Cara menggunakan ProofStamp</b>\n\n' +
    '1) Kirim file\n' +
    '2) Bayar: ⭐ {starsPrice} Stars atau 🪙 {tonPrice} TON\n' +
    '3) Terima sertifikat PDF (dengan QR)\n\n' +
    'Untuk verifikasi nanti: kirim file yang sama lagi dan gunakan /verify.\n\n' +
    '🛡️ File Anda tidak disimpan. Di sistem hanya tersisa SHA-256.',
  verify_mode: '🔍 <b>Mode verifikasi</b>\nKirim file, saya akan cek apakah sudah tercatat di TON.',
  computing_hash: '⏳ Memproses...',
  doc_info: '📄 <b>File:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Pilih metode pembayaran:',
  btn_pay_stars: '⭐ Bayar {starsPrice} Stars',
  btn_pay_ton: '💎 Bayar {tonPrice} TON',
  btn_verify_payment: '✅ Sudah bayar - Verifikasi',
  pay_ton_link: 'Kirim <b>{tonPrice} TON</b> lewat tautan ini:\n{link}',
  verifying: '🔍 Mengecek di TON...',
  payment_received: '✅ Pembayaran dikonfirmasi. Membuat sertifikat...',
  hash_recorded: '✅ <b>Tercatat di TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ Tidak ditemukan di blockchain.',
  session_expired: '⏳ Sesi berakhir. Silakan kirim file lagi.',
  error_processing: '❌ Terjadi kesalahan. Coba lagi.',
  no_doc_found: '❌ File tidak bisa dibaca. Kirim sebagai dokumen.',
  send_as_file: '📎 Kirim file sebagai dokumen (bukan foto).',
  invoice_title: 'Sertifikat ProofStamp',
  invoice_description: 'Bukti blockchain untuk hash dokumen Anda.',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 Tautan verifikasi:\n{link}',
  cert_subtitle: 'Sertifikat digital keberadaan dokumen (blockchain TON)',
  cert_file: 'FILE',
  cert_owner: 'PEMILIK / PERUSAHAAN',
  cert_tx: 'TRANSAKSI',
  cert_date: 'TANGGAL (UTC)',
  cert_explorer: 'TON Explorer',
  cert_verify: 'Tautan verifikasi',
  cert_footer:
    'Sertifikat ini mengonfirmasi bahwa sidik dokumen (SHA-256) telah dicatat di blockchain TON. ' +
    'Verifikasi dapat dilakukan lewat tautan transaksi atau dengan mengirim ulang file asli ke bot.',
};

const HI: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>भाषा चुनें</b>',
  lang_changed: '✅ भाषा अपडेट हो गई',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'TON ब्लॉकचेन पर दस्तावेज़ों का डिजिटल क्रिप्टोग्राफिक प्रमाणन।\n\n' +
    '📄 <b>यह कैसे काम करता है:</b>\n' +
    '1) कोई भी फ़ाइल भेजें\n' +
    '2) मैं SHA-256 फिंगरप्रिंट निकालता हूँ\n' +
    '3) ⭐ Stars या 💎 TON से भुगतान करें\n' +
    '4) फिंगरप्रिंट TON में रिकॉर्ड होता है\n' +
    '5) आपको QR के साथ PDF प्रमाणपत्र मिलता है\n\n' +
    '🔍 दस्तावेज़ जाँचने के लिए /verify का उपयोग करें\n\n' +
    '💡 कमांड:\n' +
    '/start - शुरू करें\n' +
    '/verify - सत्यापित करें\n' +
    '/lang - भाषा\n' +
    '/help - मदद\n' +
    '/cancel - वर्तमान सत्र रीसेट करें',
  help:
    '📖 <b>ProofStamp का उपयोग कैसे करें</b>\n\n' +
    '1) फ़ाइल भेजें\n' +
    '2) भुगतान: ⭐ {starsPrice} Stars या 💎 {tonPrice} TON\n' +
    '3) PDF प्रमाणपत्र प्राप्त करें (QR सहित)\n\n' +
    'बाद में सत्यापन के लिए: वही फ़ाइल फिर भेजें और /verify उपयोग करें।\n\n' +
    '🛡️ आपकी फ़ाइलें सेव नहीं की जातीं। सिस्टम में केवल SHA-256 रहता है।',
  verify_mode: '🔍 फ़ाइल भेजें, मैं जांचूंगा कि क्या यह TON में रिकॉर्ड है।',
  computing_hash: '⏳ प्रोसेसिंग...',
  doc_info: '📄 <b>फ़ाइल:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'भुगतान का तरीका चुनें:',
  btn_pay_stars: '⭐ {starsPrice} Stars भुगतान करें',
  btn_pay_ton: '💎 {tonPrice} TON भुगतान करें',
  btn_verify_payment: '✅ मैंने भुगतान किया - सत्यापित करें',
  pay_ton_link: '<b>{tonPrice} TON</b> इस लिंक से भेजें:\n{link}',
  verifying: '🔍 TON ब्लॉकचेन में जांच की जा रही है...',
  payment_received: '✅ भुगतान की पुष्टि हो गई। प्रमाणपत्र बनाया जा रहा है...',
  hash_recorded: '✅ <b>TON में रिकॉर्ड हो गया</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ ब्लॉकचेन में नहीं मिला।',
  session_expired: '⏳ सत्र समाप्त हो गया। कृपया फ़ाइल फिर से भेजें।',
  error_processing: '❌ त्रुटि हुई। कृपया फिर कोशिश करें।',
  no_doc_found: '❌ फ़ाइल पढ़ी नहीं जा सकी। कृपया दस्तावेज़ के रूप में भेजें।',
  processing_in_progress: '⏳ प्रोसेसिंग पहले से चल रही है। कृपया प्रतीक्षा करें।',
  rate_limited: '⏳ बहुत अधिक अनुरोध। कृपया एक मिनट बाद कोशिश करें।',
  file_too_large: '❌ फ़ाइल बहुत बड़ी है। अधिकतम सीमा: {maxMb} MB।',
  download_timeout: '❌ फ़ाइल डाउनलोड समय समाप्त। कृपया फिर कोशिश करें।',
  invalid_payment: '❌ भुगतान सत्यापन असफल। नया इनवॉइस बनाकर फिर प्रयास करें।',
  payment_already_processed: '✅ यह भुगतान पहले ही प्रोसेस हो चुका है।',
  stars_already_paid: '✅ Stars भुगतान पहले ही प्राप्त हो चुका है।',
  stars_already_paid_help: 'प्रमाणपत्र पूरा करने के लिए "मैंने भुगतान किया - सत्यापित करें" दबाएं।',
  invoice_already_created: 'इनवॉइस पहले ही बनाया जा चुका है।',
  invoice_already_created_help: 'अंतिम इनवॉइस संदेश खोलें और वहीं भुगतान पूरा करें।',
  ton_rate_limited_retry:
    '⏳ TON नेटवर्क व्यस्त है (रेट लिमिट)। भुगतान सेव है। कुछ सेकंड बाद "मैंने भुगतान किया - सत्यापित करें" दबाएं।',
  channel_stamp_btn: 'इस पोस्ट को स्टैम्प करें',
  channel_stamp_ready: '🧾 इस पोस्ट के लिए ProofStamp तैयार है। चैट एडमिन एक टैप में स्टैम्प कर सकता है।',
  channel_stamp_admin_only: 'केवल चैट एडमिन पोस्ट स्टैम्प कर सकते हैं।',
  channel_stamp_not_found: 'पोस्ट संदर्भ नहीं मिला। नई पोस्ट आने पर फिर कोशिश करें।',
  channel_stamp_started: 'स्टैम्पिंग शुरू हो गई...',
  channel_stamp_already_done: 'यह पोस्ट पहले से स्टैम्प की जा चुकी है।',
  channel_stamp_done: '✅ पोस्ट स्टैम्प हो गई और proof प्रकाशित कर दिया गया।',
  channel_stamp_disabled: 'चैनल स्टैम्प मोड बंद है।',
  channel_stamp_group_only: 'ग्रुप चैट में /stamp को लक्ष्य संदेश पर reply करके उपयोग करें।',
  channel_stamp_usage_reply: 'लक्ष्य संदेश पर /stamp से reply करें, या एडमिन पोस्ट में {tag} जोड़ें।',
  channel_stamp_payment_intro:
    '🧾 <b>पोस्ट स्टैम्प करें</b>\n' +
    'चैट: <b>{channelTitle}</b>\n' +
    'पोस्ट ID: <code>{postId}</code>\n\n' +
    'इस पोस्ट के नीचे proof प्रकाशित करने के लिए भुगतान करें:\n' +
    '⭐ {starsPrice} Stars या 💎 {tonPrice} TON।',
  channel_stamp_open_dm: 'भुगतान जारी रखने के लिए बॉट का निजी चैट खोलें।',
  channel_stamp_open_private_btn: 'बॉट खोलें',
  channel_stamp_open_private:
    'इस पोस्ट को स्टैम्प करने के लिए बॉट के निजी चैट में Start दबाएं, फिर स्टैम्प बटन दोबारा दबाएं।',
  channel_stamp_open_private_fallback:
    'बॉट का निजी चैट खोलें और Start दबाएं, फिर स्टैम्प बटन दोबारा दबाएं।',
  channel_stamp_open_private_alert: 'पहले बॉट का निजी चैट खोलें।',
  channel_stamp_send_failed: 'इस चैट में स्टैम्प बटन नहीं लग सका। बॉट एडमिन अधिकार और टॉपिक अनुमति जांचें।',
  send_as_file: '📎 कृपया फ़ाइल को दस्तावेज़ के रूप में भेजें (फोटो नहीं)।',
  send_file_hint: '📎 नोटरीकरण शुरू करने के लिए फ़ाइल को दस्तावेज़ के रूप में भेजें।',
  captcha_then_resend_file: '✅ पहले कैप्चा पूरा करें, फिर फ़ाइल दस्तावेज़ के रूप में दोबारा भेजें।',
  enter_owner_optional: '✍️ (वैकल्पिक) प्रमाणपत्र के लिए मालिक/कंपनी का नाम भेजें।',
  enter_owner_required: '✍️ पूरा नाम या संगठन दर्ज करें (प्रमाणपत्र के लिए आवश्यक)।',
  owner_saved: '✅ सेव हो गया।',
  owner_skipped: '✅ छोड़ा गया।',
  owner_hint: '✍️ नाम/कंपनी का टेक्स्ट भेजें, या "स्किप" दबाएं।',
  skip: 'स्किप',
  or_skip: 'या स्किप करें:',
  btn_cancel: 'रद्द करें',
  session_cleared: '🧹 वर्तमान सत्र साफ कर दिया गया।',
  invoice_title: 'ProofStamp प्रमाणपत्र',
  invoice_description: 'आपके दस्तावेज़ हैश का ब्लॉकचेन प्रमाण।',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 सत्यापन लिंक:\n{link}',
  captcha_title: '🛡️ <b>एंटी-स्पैम जांच</b>',
  captcha_prompt: '<b>{color}</b> रंग का वर्ग चुनें:',
  captcha_success: '✅ सत्यापन सफल। अब आप बॉट का उपयोग कर सकते हैं।',
  captcha_try_again: '❌ गलत। फिर से कोशिश करें।',
  color_red: 'लाल',
  color_green: 'हरा',
  color_blue: 'नीला',
  color_yellow: 'पीला',
  cert_subtitle: 'दस्तावेज़ अस्तित्व का डिजिटल प्रमाणपत्र (टोन ब्लॉकचेन)',
  cert_file: 'फ़ाइल',
  cert_owner: 'मालिक / कंपनी',
  cert_tx: 'ट्रांज़ैक्शन',
  cert_date: 'तारीख (यूटीसी)',
  cert_explorer: 'टोन एक्सप्लोरर',
  cert_verify: 'सत्यापन लिंक',
  cert_footer:
    'यह प्रमाणपत्र पुष्टि करता है कि दस्तावेज़ फिंगरप्रिंट (SHA-256) TON ब्लॉकचेन में रिकॉर्ड किया गया है। ' +
    'सत्यापन ट्रांज़ैक्शन लिंक से या मूल फ़ाइल बॉट को फिर भेजकर किया जा सकता है।',
};

const ZH: Record<string, string> = {
  ...EN,
  choose_language: '🌐 <b>选择语言</b>',
  lang_changed: '✅ 语言已更新',
  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    '在 TON 区块链上进行文档数字加密认证。\n\n' +
    '📄 <b>工作流程：</b>\n' +
    '1) 发送任意文件\n' +
    '2) 我会计算 SHA-256 指纹\n' +
    '3) 使用 ⭐ Stars 或 🪙 TON 支付\n' +
    '4) 指纹写入 TON 区块链\n' +
    '5) 你将收到带 QR 的 PDF 证书\n\n' +
    '🔍 验证文档请使用 /verify\n\n' +
    '💡 命令：\n' +
    '/start - 开始\n' +
    '/verify - 验证\n' +
    '/lang - 语言\n' +
    '/help - 帮助',
  help:
    '📖 <b>如何使用 ProofStamp</b>\n\n' +
    '1) 发送文件\n' +
    '2) 支付：⭐ {starsPrice} Stars 或 🪙 {tonPrice} TON\n' +
    '3) 获取 PDF 证书（含 QR）\n\n' +
    '稍后验证：再次发送同一文件并使用 /verify。\n\n' +
    '🛡️ 您的文件不会被保存，系统仅保留 SHA-256。',
  verify_mode: '🔍 <b>验证模式</b>\n发送文件后，我会检查是否已记录到 TON。',
  computing_hash: '⏳ 处理中...',
  doc_info: '📄 <b>文件：</b> {fileName}\n🔑 <b>SHA-256：</b>\n<code>{hash}</code>',
  choose_payment: '请选择支付方式：',
  btn_pay_stars: '⭐ 支付 {starsPrice} Stars',
  btn_pay_ton: '💎 支付 {tonPrice} TON',
  btn_verify_payment: '✅ 我已支付 - 验证',
  pay_ton_link: '请通过此链接发送 <b>{tonPrice} TON</b>：\n{link}',
  verifying: '🔍 正在 TON 上校验...',
  payment_received: '✅ 支付已确认，正在生成证书...',
  hash_recorded: '✅ <b>已记录到 TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ 区块链中未找到。',
  session_expired: '⏳ 会话已过期，请重新发送文件。',
  error_processing: '❌ 出错了，请重试。',
  no_doc_found: '❌ 无法读取文件，请以文档形式发送。',
  send_as_file: '📎 请以文档形式发送文件（不要以照片发送）。',
  invoice_title: 'ProofStamp 证书',
  invoice_description: '为你的文档哈希提供区块链证明。',
  invoice_label: 'ProofStamp',
  verify_link_text: '🔗 验证链接：\n{link}',
  cert_subtitle: '文档存在性数字证书（TON 区块链）',
  cert_file: '文件',
  cert_owner: '所有者 / 公司',
  cert_tx: '交易',
  cert_date: '日期 (UTC)',
  cert_explorer: 'TON 浏览器',
  cert_verify: '验证链接',
  cert_footer:
    '此证书确认该文档指纹（SHA-256）已记录在 TON 区块链中。' +
    '你可以通过交易链接验证，或将原始文件再次发送给机器人进行验证。',
};

const translations: Record<Lang, Record<string, string>> = {
  en: EN,
  ru: RU,
  zh: ZH,
  es: ES,
  pt: PT,
  de: DE,
  fr: FR,
  tr: TR,
  ar: AR,
  id: ID,
  hi: HI,
};

// Persist language preferences to survive restarts.
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
const langFile = path.join(dataDir, 'langs.json');

type LangStore = Record<string, Lang>;
let store: LangStore = {};

function loadStore() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(langFile)) {
      store = JSON.parse(fs.readFileSync(langFile, 'utf8')) as LangStore;
    }
  } catch {
    store = {};
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(langFile, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // ignore
  }
}

loadStore();

export function setLang(userId: number, lang: Lang): void {
  store[String(userId)] = lang;
  saveStore();
}

export function getLang(userId: number): Lang {
  return store[String(userId)] || 'en';
}

export function normalizeLang(code?: string): Lang {
  const c = (code || '').toLowerCase();
  if (c.startsWith('ru')) return 'ru';
  if (c.startsWith('zh')) return 'zh';
  if (c.startsWith('es')) return 'es';
  if (c.startsWith('pt')) return 'pt';
  if (c.startsWith('de')) return 'de';
  if (c.startsWith('fr')) return 'fr';
  if (c.startsWith('tr')) return 'tr';
  if (c.startsWith('ar')) return 'ar';
  if (c.startsWith('id')) return 'id';
  if (c.startsWith('hi')) return 'hi';
  return 'en';
}

function formatTemplate(text: string, params?: Params): string {
  if (!params) return text;
  let result = text;
  for (const [k, v] of Object.entries(params)) {
    result = result.split(`{${k}}`).join(String(v));
  }
  return result;
}

export function tForLang(lang: Lang, key: string, params?: Params): string {
  const text = translations[lang]?.[key] || translations.en[key] || key;
  return formatTemplate(text, params);
}

export function t(userId: number, key: string, params?: Params): string {
  return tForLang(getLang(userId), key, params);
}




