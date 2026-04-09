// Top 10 most common Telegram languages for global audiences.
export type Lang = 'ru' | 'en' | 'zh' | 'es' | 'pt' | 'de' | 'fr' | 'tr' | 'ar' | 'id' | 'hi';

type Params = Record<string, string | number>;

const EN: Record<string, string> = {
  choose_language: '🌐 <b>Choose language</b>',
  lang_changed: '✅ Language updated',

  welcome:
    '🔏 <b>ProofStamp</b>\n\n' +
    'Digital cryptographic certification service for files, documents and posts on the TON blockchain.\n\n' +
    '📄 <b>How it works:</b>\n' +
    '1) Send a file or post\n' +
    '2) The bot calculates SHA-256\n' +
    '3) For posts, you can save the original text\n' +
    '4) Pay: ⭐ Stars or 💎 TON\n' +
    '5) The data is recorded on the blockchain\n' +
    '6) You receive a PDF certificate with QR+TX\n\n' +
    '💡 Commands:\n' +
    '/start - start\n' +
    '/verify - verify\n' +
    '/lang - language\n' +
    '/help - help\n' +
    '/cancel - reset session',
  help:
    '📖 <b>How to use ProofStamp</b>\n\n' +
    '1) Send a file\n' +
    '2) Payment: ⭐ {starsPrice} Stars or 💎 {tonPrice} TON\n' +
    '3) Receive a PDF certificate (with QR+TX)\n\n' +
    '🛡️ Your files are not stored. Only SHA-256 remains in the system.\n\n' +
    'To verify later, send the same file again and use /verify.',
  help_post_text_feature:
    '📝 For posts in groups and channels, you can choose Proof + text and save the full original post text in TON for ⭐ {starsPrice} Stars or 💎 {tonPrice} TON.',

  verify_mode: '🔍 Send a file and I will check if it is recorded in TON.',
  computing_hash: '⏳ Processing...',
  doc_info: '📄 <b>File:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',

  choose_payment: 'Choose payment method:',
  btn_pay_stars: 'Pay ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Pay 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Paid, verify',
  pay_ton_link: 'Send <b>{tonPrice} TON</b> using this link:\n{link}',

  verifying: '🔍 Checking TON blockchain...',
  payment_received: '✅ Payment confirmed. Generating certificate...',
  hash_recorded: '✅ <b>Recorded in TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ Not found in blockchain.',
  ton_payment_underpaid:
    '⚠️ Payment was found, but amount is below required <b>{tonPrice} TON</b>. ' +
    'Please send full amount and tap "Verify" again.',
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
  stars_already_paid_help: 'Tap "Verify" to finish certificate processing.',
  invoice_already_created: 'Invoice is already created.',
  invoice_already_created_help: 'Open the last invoice message and complete payment there.',
  ton_rate_limited_retry: '⏳ TON network is busy (rate limit). Payment is saved. Please tap "Verify" in a few seconds.',
  channel_stamp_btn: 'Stamp this post',
  channel_stamp_ready: '🧾 ProofStamp is ready for this post. Chat admin can stamp it with one tap.',
  channel_stamp_admin_only: 'Only chat admins can stamp posts.',
  channel_stamp_not_found: 'Post context not found. Wait for a fresh post and try again.',
  channel_stamp_started: 'Stamping started...',
  channel_stamp_already_done: 'This post is already stamped.',
  channel_stamp_done: '✅ Post stamped and proof published.',
  channel_stamp_done_with_text: '✅ Post stamped, proof published, text saved in TON.',
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
  channel_stamp_mode_title: '📝 <b>What to save for this post?</b>',
  channel_stamp_mode_hash_only: 'Proof only',
  channel_stamp_mode_hash_text: 'Proof + text',
  channel_stamp_mode_hash_only_hint:
    '1) Save only the post proof hash in TON.\nPrice: ⭐ {starsPrice} Stars or 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Save the post proof and the full post text in TON.\nPrice: ⭐ {starsPrice} Stars or 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ Post text in TON will be public and permanent.',
  channel_stamp_mode_text_too_long:
    '⚠️ Post text is too long for TON. Only <b>Proof only</b> is available for this post.',
  channel_stamp_mode_text_too_long_short: 'Text is too long for TON',
  channel_stamp_mode_hash_only_selected: 'Proof only selected',
  channel_stamp_mode_hash_text_selected: 'Proof + text selected',
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
  btn_cancel: '❌ Cancel',
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
    'Сервис цифрового криптографического заверения файлов, документов и постов в блокчейне TON.\n\n' +
    '📄 <b>Как это работает:</b>\n' +
    '1) Отправьте файл или пост\n' +
    '2) Бот вычислит SHA-256\n' +
    '3) Для постов можно сохранить исходный текст\n' +
    '4) Оплатите: ⭐ Stars или 💎 TON\n' +
    '5) Данные будут записаны в блокчейн\n' +
    '6) Вы получите PDF-сертификат с QR+TX\n\n' +
    '💡 Команды:\n' +
    '/start - старт\n' +
    '/verify - проверка\n' +
    '/lang - язык\n' +
    '/help - помощь\n' +
    '/cancel - сбросить сессию',
  help:
    '📖 <b>Как пользоваться ProofStamp</b>\n\n' +
    '1) Отправьте файл\n' +
    '2) Оплата: ⭐ {starsPrice} Stars или 💎 {tonPrice} TON\n' +
    '3) Получите PDF-сертификат (с QR+TX)\n\n' +
    '🛡️ Ваши файлы не сохраняются. В системе остается только SHA-256.\n\n' +
    'Для проверки позже отправьте тот же файл и используйте /verify.',
  help_post_text_feature:
    '📝 Для постов в группах и каналах можно выбрать Proof + текст и сохранить полный исходный текст поста в TON за ⭐ {starsPrice} Stars или 💎 {tonPrice} TON.',
  verify_mode: '🔍 Отправьте файл, и я проверю, записан ли он в TON.',
  computing_hash: '⏳ Обрабатываю...',
  doc_info: '📄 <b>Файл:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Выберите способ оплаты:',
  btn_pay_stars: 'Оплатить ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Оплатить 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Оплатил, проверить',
  pay_ton_link: 'Отправьте <b>{tonPrice} TON</b> по ссылке:\n{link}',
  verifying: '🔍 Проверяю в блокчейне TON...',
  payment_received: '✅ Платеж подтвержден. Формирую сертификат...',
  hash_recorded: '✅ <b>Записано в TON</b>\nTX: <a href="{explorerUrl}">{txHash}</a>',
  not_found: '❌ В блокчейне не найдено.',
  ton_payment_underpaid:
    '⚠️ Платеж найден, но сумма меньше требуемых <b>{tonPrice} TON</b>. ' +
    'Отправьте полную сумму и нажмите «Проверить» еще раз.',
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
  stars_already_paid_help: 'Нажмите «Проверить», чтобы завершить выпуск сертификата.',
  invoice_already_created: 'Инвойс уже создан.',
  invoice_already_created_help: 'Откройте последнее сообщение с инвойсом и завершите оплату там.',
  ton_rate_limited_retry: '⏳ TON сеть перегружена (лимит API). Оплата сохранена. Нажмите «Проверить» через несколько секунд.',
  channel_stamp_btn: 'Зафиксировать пост',
  channel_stamp_ready: '🧾 ProofStamp готов для этого поста. Админ чата может зафиксировать его в один тап.',
  channel_stamp_admin_only: 'Только админы чата могут фиксировать посты.',
  channel_stamp_not_found: 'Контекст поста не найден. Дождитесь нового поста и попробуйте снова.',
  channel_stamp_started: 'Фиксация запущена...',
  channel_stamp_already_done: 'Этот пост уже зафиксирован.',
  channel_stamp_done: '✅ Пост зафиксирован, proof опубликован.',
  channel_stamp_done_with_text: '✅ Пост зафиксирован, proof опубликован, текст сохранен в TON.',
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
  channel_stamp_mode_title: '📝 <b>Что сохранить для этого поста?</b>',
  channel_stamp_mode_hash_only: 'Только proof',
  channel_stamp_mode_hash_text: 'Proof + текст',
  channel_stamp_mode_hash_only_hint:
    '1) Сохранить в TON только proof-хеш поста.\nЦена: ⭐ {starsPrice} Stars или 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Сохранить в TON proof поста и полный текст поста.\nЦена: ⭐ {starsPrice} Stars или 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ Текст поста в TON будет публичным и постоянным.',
  channel_stamp_mode_text_too_long:
    '⚠️ Текст поста слишком длинный для TON. Для этого поста доступен только режим <b>Только proof</b>.',
  channel_stamp_mode_text_too_long_short: 'Текст слишком длинный для TON',
  channel_stamp_mode_hash_only_selected: 'Выбран только proof',
  channel_stamp_mode_hash_text_selected: 'Выбран proof + текст',
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
  btn_cancel: '❌ Отмена',
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
    'Servicio de certificación criptográfica digital de archivos, documentos y publicaciones en la blockchain TON.\n\n' +
    '📄 <b>Cómo funciona:</b>\n' +
    '1) Envía un archivo o una publicación\n' +
    '2) El bot calcula SHA-256\n' +
    '3) Para publicaciones, puedes guardar el texto original\n' +
    '4) Pago: ⭐ Stars o 💎 TON\n' +
    '5) Los datos se registran en la blockchain\n' +
    '6) Recibes un certificado PDF con QR+TX\n\n' +
    '💡 Comandos:\n' +
    '/start - iniciar\n' +
    '/verify - verificar\n' +
    '/lang - idioma\n' +
    '/help - ayuda\n' +
    '/cancel - reiniciar sesión',
  help:
    '📖 <b>Cómo usar ProofStamp</b>\n\n' +
    '1) Envía un archivo\n' +
    '2) Pago: ⭐ {starsPrice} Stars o 💎 {tonPrice} TON\n' +
    '3) Recibe un certificado PDF (con QR+TX)\n\n' +
    '🛡️ Tus archivos no se guardan. En el sistema solo queda SHA-256.\n\n' +
    'Para verificar después, envía el mismo archivo otra vez y usa /verify.',
  help_post_text_feature:
    '📝 Para publicaciones en grupos y canales puedes elegir Proof + texto y guardar el texto original completo de la publicación en TON por ⭐ {starsPrice} Stars o 💎 {tonPrice} TON.',
  verify_mode: '🔍 <b>Modo verificación</b>\nEnvía un archivo y comprobaré si está registrado en TON.',
  computing_hash: '⏳ Procesando...',
  doc_info: '📄 <b>Archivo:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Elige método de pago:',
  btn_pay_stars: 'Pagar ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Pagar 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Pagado, verificar',
  btn_cancel: '❌ Cancelar',
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
  channel_stamp_done_with_text: '✅ Publicación sellada, proof publicado y texto guardado en TON.',
  channel_stamp_payment_intro:
    '🧾 <b>Sellar publicación</b>\n' +
    'Chat: <b>{channelTitle}</b>\n' +
    'ID de publicación: <code>{postId}</code>\n\n' +
    'Para publicar el proof debajo de esta publicación, paga:\n' +
    '⭐ {starsPrice} Stars o 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>¿Qué guardar para esta publicación?</b>',
  channel_stamp_mode_hash_only: 'Solo proof',
  channel_stamp_mode_hash_text: 'Proof + texto',
  channel_stamp_mode_hash_only_hint:
    '1) Guardar solo el hash proof de la publicación en TON.\nPrecio: ⭐ {starsPrice} Stars o 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Guardar el proof de la publicación y el texto completo en TON.\nPrecio: ⭐ {starsPrice} Stars o 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ El texto de la publicación en TON será público y permanente.',
  channel_stamp_mode_text_too_long:
    '⚠️ El texto de la publicación es demasiado largo para TON. Para esta publicación solo está disponible <b>Solo proof</b>.',
  channel_stamp_mode_text_too_long_short: 'Texto demasiado largo para TON',
  channel_stamp_mode_hash_only_selected: 'Seleccionado: solo proof',
  channel_stamp_mode_hash_text_selected: 'Seleccionado: proof + texto',
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
    'Serviço de certificação criptográfica digital de arquivos, documentos e publicações na blockchain TON.\n\n' +
    '📄 <b>Como funciona:</b>\n' +
    '1) Envie um arquivo ou uma publicação\n' +
    '2) O bot calcula SHA-256\n' +
    '3) Para publicações, você pode salvar o texto original\n' +
    '4) Pagamento: ⭐ Stars ou 💎 TON\n' +
    '5) Os dados são registrados na blockchain\n' +
    '6) Você recebe um certificado PDF com QR+TX\n\n' +
    '💡 Comandos:\n' +
    '/start - iniciar\n' +
    '/verify - verificar\n' +
    '/lang - idioma\n' +
    '/help - ajuda\n' +
    '/cancel - redefinir sessão',
  help:
    '📖 <b>Como usar o ProofStamp</b>\n\n' +
    '1) Envie um arquivo\n' +
    '2) Pagamento: ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON\n' +
    '3) Receba um certificado PDF (com QR+TX)\n\n' +
    '🛡️ Seus arquivos não são salvos. No sistema fica apenas o SHA-256.\n\n' +
    'Para verificar depois, envie o mesmo arquivo novamente e use /verify.',
  help_post_text_feature:
    '📝 Para posts em grupos e canais, você pode escolher Proof + texto e salvar o texto original completo da publicação em TON por ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  verify_mode: '🔍 <b>Modo de verificação</b>\nEnvie um arquivo e eu verificarei se ele está registrado na TON.',
  computing_hash: '⏳ Processando...',
  doc_info: '📄 <b>Arquivo:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Escolha o método de pagamento:',
  btn_pay_stars: 'Pagar ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Pagar 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Pago, verificar',
  btn_cancel: '❌ Cancelar',
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
  channel_stamp_done_with_text: '✅ Post fixado, proof publicado e texto salvo na TON.',
  channel_stamp_payment_intro:
    '🧾 <b>Fixar post</b>\n' +
    'Chat: <b>{channelTitle}</b>\n' +
    'ID do post: <code>{postId}</code>\n\n' +
    'Para publicar o proof abaixo deste post, pague:\n' +
    '⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>O que salvar para este post?</b>',
  channel_stamp_mode_hash_only: 'Só proof',
  channel_stamp_mode_hash_text: 'Proof + texto',
  channel_stamp_mode_hash_only_hint:
    '1) Salvar apenas o hash proof do post na TON.\nPreço: ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Salvar o proof do post e o texto completo do post na TON.\nPreço: ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ O texto do post na TON será público e permanente.',
  channel_stamp_mode_text_too_long:
    '⚠️ O texto do post é longo demais para a TON. Para este post, apenas <b>Só proof</b> está disponível.',
  channel_stamp_mode_text_too_long_short: 'Texto longo demais para a TON',
  channel_stamp_mode_hash_only_selected: 'Selecionado: só proof',
  channel_stamp_mode_hash_text_selected: 'Selecionado: proof + texto',
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
    'Dienst zur digitalen kryptografischen Beglaubigung von Dateien, Dokumenten und Beiträgen in der TON-Blockchain.\n\n' +
    '📄 <b>So funktioniert es:</b>\n' +
    '1) Sende eine Datei oder einen Beitrag\n' +
    '2) Der Bot berechnet SHA-256\n' +
    '3) Bei Beiträgen kannst du den Originaltext speichern\n' +
    '4) Bezahle: ⭐ Stars oder 💎 TON\n' +
    '5) Die Daten werden in der Blockchain gespeichert\n' +
    '6) Du erhältst ein PDF-Zertifikat mit QR+TX\n\n' +
    '💡 Befehle:\n' +
    '/start - starten\n' +
    '/verify - prüfen\n' +
    '/lang - sprache\n' +
    '/help - hilfe\n' +
    '/cancel - sitzung zurücksetzen',
  help:
    '📖 <b>So nutzt du ProofStamp</b>\n\n' +
    '1) Sende eine Datei\n' +
    '2) Zahlung: ⭐ {starsPrice} Stars oder 💎 {tonPrice} TON\n' +
    '3) Erhalte ein PDF-Zertifikat (mit QR+TX)\n\n' +
    '🛡️ Deine Dateien werden nicht gespeichert. Im System bleibt nur SHA-256.\n\n' +
    'Zum späteren Prüfen sende dieselbe Datei erneut und nutze /verify.',
  help_post_text_feature:
    '📝 Für Beiträge in Gruppen und Kanälen kannst du Proof + Text wählen und den vollständigen Originaltext des Beitrags in TON für ⭐ {starsPrice} Stars oder 💎 {tonPrice} TON speichern.',
  verify_mode: '🔍 <b>Prüfmodus</b>\nSende eine Datei und ich prüfe, ob sie in TON gespeichert ist.',
  computing_hash: '⏳ Verarbeitung...',
  doc_info: '📄 <b>Datei:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Wähle eine Zahlungsmethode:',
  btn_pay_stars: 'Zahlen ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Zahlen 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Bezahlt, prüfen',
  btn_cancel: '❌ Abbrechen',
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
  channel_stamp_done_with_text: '✅ Beitrag gestempelt, Proof veröffentlicht und Text in TON gespeichert.',
  channel_stamp_payment_intro:
    '🧾 <b>Beitrag stempeln</b>\n' +
    'Chat: <b>{channelTitle}</b>\n' +
    'Beitrags-ID: <code>{postId}</code>\n\n' +
    'Um den Proof unter diesem Beitrag zu veröffentlichen, zahle:\n' +
    '⭐ {starsPrice} Stars oder 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>Was soll für diesen Beitrag gespeichert werden?</b>',
  channel_stamp_mode_hash_only: 'Nur Proof',
  channel_stamp_mode_hash_text: 'Proof + Text',
  channel_stamp_mode_hash_only_hint:
    '1) Nur den Proof-Hash des Beitrags in TON speichern.\nPreis: ⭐ {starsPrice} Stars oder 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Den Proof des Beitrags und den vollständigen Beitragstext in TON speichern.\nPreis: ⭐ {starsPrice} Stars oder 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ Der Beitragstext in TON wird öffentlich und dauerhaft sein.',
  channel_stamp_mode_text_too_long:
    '⚠️ Der Beitragstext ist für TON zu lang. Für diesen Beitrag ist nur <b>Nur Proof</b> verfügbar.',
  channel_stamp_mode_text_too_long_short: 'Text zu lang für TON',
  channel_stamp_mode_hash_only_selected: 'Ausgewählt: nur Proof',
  channel_stamp_mode_hash_text_selected: 'Ausgewählt: Proof + Text',
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
    'Service de certification cryptographique numérique des fichiers, documents et posts sur la blockchain TON.\n\n' +
    '📄 <b>Comment ça marche :</b>\n' +
    '1) Envoyez un fichier ou un post\n' +
    '2) Le bot calcule SHA-256\n' +
    '3) Pour les posts, vous pouvez enregistrer le texte original\n' +
    '4) Paiement : ⭐ Stars ou 💎 TON\n' +
    '5) Les données sont enregistrées dans la blockchain\n' +
    '6) Vous recevez un certificat PDF avec QR+TX\n\n' +
    '💡 Commandes :\n' +
    '/start - démarrer\n' +
    '/verify - vérifier\n' +
    '/lang - langue\n' +
    '/help - aide\n' +
    '/cancel - réinitialiser la session',
  help:
    '📖 <b>Comment utiliser ProofStamp</b>\n\n' +
    '1) Envoyez un fichier\n' +
    '2) Paiement : ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON\n' +
    '3) Recevez un certificat PDF (avec QR+TX)\n\n' +
    '🛡️ Vos fichiers ne sont pas conservés. Seul SHA-256 reste dans le système.\n\n' +
    'Pour vérifier plus tard, renvoyez le même fichier et utilisez /verify.',
  help_post_text_feature:
    '📝 Pour les posts dans les groupes et les canaux, vous pouvez choisir Proof + texte et enregistrer le texte original complet du post dans TON pour ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  verify_mode: '🔍 <b>Mode vérification</b>\nEnvoyez un fichier et je vérifierai s’il est enregistré dans TON.',
  computing_hash: '⏳ Traitement en cours...',
  doc_info: '📄 <b>Fichier :</b> {fileName}\n🔑 <b>SHA-256 :</b>\n<code>{hash}</code>',
  choose_payment: 'Choisissez le mode de paiement :',
  btn_pay_stars: 'Payer ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Payer 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Payé, vérifier',
  btn_cancel: '❌ Annuler',
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
  channel_stamp_done_with_text: '✅ Post horodaté, proof publié et texte enregistré dans TON.',
  channel_stamp_payment_intro:
    '🧾 <b>Horodater le post</b>\n' +
    'Chat : <b>{channelTitle}</b>\n' +
    'ID du post : <code>{postId}</code>\n\n' +
    'Pour publier le proof sous ce post, payez :\n' +
    '⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>Que faut-il enregistrer pour ce post ?</b>',
  channel_stamp_mode_hash_only: 'Proof uniquement',
  channel_stamp_mode_hash_text: 'Proof + texte',
  channel_stamp_mode_hash_only_hint:
    '1) Enregistrer uniquement le hash proof du post dans TON.\nPrix : ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Enregistrer le proof du post et le texte complet du post dans TON.\nPrix : ⭐ {starsPrice} Stars ou 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ Le texte du post dans TON sera public et permanent.',
  channel_stamp_mode_text_too_long:
    '⚠️ Le texte du post est trop long pour TON. Seul le mode <b>Proof uniquement</b> est disponible pour ce post.',
  channel_stamp_mode_text_too_long_short: 'Texte trop long pour TON',
  channel_stamp_mode_hash_only_selected: 'Sélectionné : proof uniquement',
  channel_stamp_mode_hash_text_selected: 'Sélectionné : proof + texte',
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
    'TON blokzincirinde dosyalar, belgeler ve gönderiler için dijital kriptografik sertifikasyon hizmeti.\n\n' +
    '📄 <b>Nasıl çalışır:</b>\n' +
    '1) Bir dosya veya gönderi gönderin\n' +
    '2) Bot SHA-256 hesaplar\n' +
    '3) Gönderiler için orijinal metni kaydedebilirsiniz\n' +
    '4) Ödeme: ⭐ Stars veya 💎 TON\n' +
    '5) Veriler blokzincire kaydedilir\n' +
    '6) QR+TX içeren PDF sertifika alırsınız\n\n' +
    '💡 Komutlar:\n' +
    '/start - başlat\n' +
    '/verify - doğrula\n' +
    '/lang - dil\n' +
    '/help - yardım\n' +
    '/cancel - oturumu sıfırla',
  help:
    '📖 <b>ProofStamp nasıl kullanılır</b>\n\n' +
    '1) Bir dosya gönderin\n' +
    '2) Ödeme: ⭐ {starsPrice} Stars veya 💎 {tonPrice} TON\n' +
    '3) PDF sertifika alın (QR+TX ile)\n\n' +
    '🛡️ Dosyalarınız saklanmaz. Sistemde yalnızca SHA-256 kalır.\n\n' +
    'Daha sonra doğrulamak için aynı dosyayı tekrar gönderin ve /verify kullanın.',
  help_post_text_feature:
    '📝 Gruplardaki ve kanallardaki gönderiler için Proof + metin seçebilir ve gönderinin tam orijinal metnini TON içinde ⭐ {starsPrice} Stars veya 💎 {tonPrice} TON karşılığında kaydedebilirsiniz.',
  verify_mode: '🔍 <b>Doğrulama modu</b>\nBir dosya gönderin, TON’da kayıtlı mı kontrol edeyim.',
  computing_hash: '⏳ İşleniyor...',
  doc_info: '📄 <b>Dosya:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Ödeme yöntemini seçin:',
  btn_pay_stars: 'Öde ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Öde 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Ödendi, doğrula',
  btn_cancel: '❌ İptal',
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
  channel_stamp_done_with_text: '✅ Gönderi damgalandı, proof yayınlandı ve metin TON\'da kaydedildi.',
  channel_stamp_payment_intro:
    '🧾 <b>Gönderiyi damgala</b>\n' +
    'Sohbet: <b>{channelTitle}</b>\n' +
    'Gönderi kimliği: <code>{postId}</code>\n\n' +
    'Bu gönderinin altında proof yayınlamak için ödeme yapın:\n' +
    '⭐ {starsPrice} Stars veya 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>Bu gönderi için ne kaydedilsin?</b>',
  channel_stamp_mode_hash_only: 'Yalnızca proof',
  channel_stamp_mode_hash_text: 'Proof + metin',
  channel_stamp_mode_hash_only_hint:
    '1) Gönderinin yalnızca proof hash değerini TON\'da kaydet.\nFiyat: ⭐ {starsPrice} Stars veya 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Gönderinin proof\'unu ve tam metnini TON\'da kaydet.\nFiyat: ⭐ {starsPrice} Stars veya 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ Gönderi metni TON\'da herkese açık ve kalıcı olacaktır.',
  channel_stamp_mode_text_too_long:
    '⚠️ Gönderi metni TON için fazla uzun. Bu gönderi için yalnızca <b>Yalnızca proof</b> kullanılabilir.',
  channel_stamp_mode_text_too_long_short: 'Metin TON için çok uzun',
  channel_stamp_mode_hash_only_selected: 'Seçildi: yalnızca proof',
  channel_stamp_mode_hash_text_selected: 'Seçildi: proof + metin',
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
    'خدمة توثيق تشفير رقمي للملفات والمستندات والمنشورات على بلوكتشين TON.\n\n' +
    '📄 <b>كيف يعمل:</b>\n' +
    '1) أرسل ملفًا أو منشورًا\n' +
    '2) يحسب البوت SHA-256\n' +
    '3) بالنسبة للمنشورات يمكنك حفظ النص الأصلي\n' +
    '4) الدفع: ⭐ Stars أو 💎 TON\n' +
    '5) يتم تسجيل البيانات على البلوكشين\n' +
    '6) تحصل على شهادة PDF مع QR+TX\n\n' +
    '💡 الأوامر:\n' +
    '/start - بدء\n' +
    '/verify - تحقق\n' +
    '/lang - اللغة\n' +
    '/help - مساعدة\n' +
    '/cancel - إعادة تعيين الجلسة',
  help:
    '📖 <b>كيفية استخدام ProofStamp</b>\n\n' +
    '1) أرسل ملفًا\n' +
    '2) الدفع: ⭐ {starsPrice} Stars أو 💎 {tonPrice} TON\n' +
    '3) احصل على شهادة PDF (مع QR+TX)\n\n' +
    '🛡️ ملفاتك لا يتم حفظها. يبقى فقط SHA-256 في النظام.\n\n' +
    'للتحقق لاحقًا، أرسل الملف نفسه مرة أخرى واستخدم /verify.',
  help_post_text_feature:
    '📝 بالنسبة للمنشورات في المجموعات والقنوات، يمكنك اختيار Proof + نص وحفظ النص الأصلي الكامل للمنشور في TON مقابل ⭐ {starsPrice} Stars أو 💎 {tonPrice} TON.',
  verify_mode: '🔍 <b>وضع التحقق</b>\nأرسل ملفًا وسأتحقق إن كان مسجلًا في TON.',
  computing_hash: '⏳ جاري المعالجة...',
  doc_info: '📄 <b>الملف:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'اختر طريقة الدفع:',
  btn_pay_stars: 'ادفع ⭐ {starsPrice} Stars',
  btn_pay_ton: 'ادفع 💎 {tonPrice} TON',
  btn_verify_payment: '✅ تم الدفع، تحقق',
  btn_cancel: '❌ إلغاء',
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
  channel_stamp_done_with_text: '✅ تم ختم المنشور، ونشر proof، وحفظ النص في TON.',
  channel_stamp_payment_intro:
    '🧾 <b>ختم المنشور</b>\n' +
    'الدردشة: <b>{channelTitle}</b>\n' +
    'معرّف المنشور: <code>{postId}</code>\n\n' +
    'لنشر الـ proof أسفل هذا المنشور، ادفع:\n' +
    '⭐ {starsPrice} Stars أو 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>ماذا تريد حفظه لهذا المنشور؟</b>',
  channel_stamp_mode_hash_only: 'الـ proof فقط',
  channel_stamp_mode_hash_text: 'Proof + النص',
  channel_stamp_mode_hash_only_hint:
    '1) احفظ فقط هاش الـ proof الخاص بالمنشور في TON.\nالسعر: ⭐ {starsPrice} Stars أو 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) احفظ proof المنشور والنص الكامل للمنشور في TON.\nالسعر: ⭐ {starsPrice} Stars أو 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ نص المنشور في TON سيكون عامًا ودائمًا.',
  channel_stamp_mode_text_too_long:
    '⚠️ نص المنشور طويل جدًا بالنسبة إلى TON. لهذا المنشور يتوفر فقط وضع <b>الـ proof فقط</b>.',
  channel_stamp_mode_text_too_long_short: 'النص طويل جدًا بالنسبة إلى TON',
  channel_stamp_mode_hash_only_selected: 'تم اختيار: الـ proof فقط',
  channel_stamp_mode_hash_text_selected: 'تم اختيار: proof + النص',
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
    'Layanan sertifikasi kriptografis digital untuk file, dokumen, dan postingan di blockchain TON.\n\n' +
    '📄 <b>Cara kerja:</b>\n' +
    '1) Kirim file atau postingan\n' +
    '2) Bot menghitung SHA-256\n' +
    '3) Untuk postingan, Anda dapat menyimpan teks asli\n' +
    '4) Pembayaran: ⭐ Stars atau 💎 TON\n' +
    '5) Data dicatat di blockchain\n' +
    '6) Anda menerima sertifikat PDF dengan QR+TX\n\n' +
    '💡 Perintah:\n' +
    '/start - mulai\n' +
    '/verify - verifikasi\n' +
    '/lang - bahasa\n' +
    '/help - bantuan\n' +
    '/cancel - reset sesi',
  help:
    '📖 <b>Cara menggunakan ProofStamp</b>\n\n' +
    '1) Kirim file\n' +
    '2) Pembayaran: ⭐ {starsPrice} Stars atau 💎 {tonPrice} TON\n' +
    '3) Terima sertifikat PDF (dengan QR+TX)\n\n' +
    '🛡️ File Anda tidak disimpan. Hanya SHA-256 yang tersisa di sistem.\n\n' +
    'Untuk verifikasi nanti, kirim file yang sama lagi dan gunakan /verify.',
  help_post_text_feature:
    '📝 Untuk postingan di grup dan channel, Anda dapat memilih Proof + teks dan menyimpan teks asli lengkap postingan di TON seharga ⭐ {starsPrice} Stars atau 💎 {tonPrice} TON.',
  verify_mode: '🔍 <b>Mode verifikasi</b>\nKirim file, saya akan cek apakah sudah tercatat di TON.',
  computing_hash: '⏳ Memproses...',
  doc_info: '📄 <b>File:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'Pilih metode pembayaran:',
  btn_pay_stars: 'Bayar ⭐ {starsPrice} Stars',
  btn_pay_ton: 'Bayar 💎 {tonPrice} TON',
  btn_verify_payment: '✅ Sudah bayar, verifikasi',
  btn_cancel: '❌ Batal',
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
  channel_stamp_done_with_text: '✅ Post ditandai, proof dipublikasikan, dan teks disimpan di TON.',
  channel_stamp_payment_intro:
    '🧾 <b>Stempel post</b>\n' +
    'Chat: <b>{channelTitle}</b>\n' +
    'ID post: <code>{postId}</code>\n\n' +
    'Untuk mempublikasikan proof di bawah post ini, bayar:\n' +
    '⭐ {starsPrice} Stars atau 💎 {tonPrice} TON.',
  channel_stamp_mode_title: '📝 <b>Apa yang disimpan untuk post ini?</b>',
  channel_stamp_mode_hash_only: 'Hanya proof',
  channel_stamp_mode_hash_text: 'Proof + teks',
  channel_stamp_mode_hash_only_hint:
    '1) Simpan hanya hash proof post di TON.\nHarga: ⭐ {starsPrice} Stars atau 💎 {tonPrice} TON.',
  channel_stamp_mode_hash_text_hint:
    '2) Simpan proof post dan teks lengkap post di TON.\nHarga: ⭐ {starsPrice} Stars atau 💎 {tonPrice} TON.',
  channel_stamp_mode_text_warning: '⚠️ Teks post di TON akan bersifat publik dan permanen.',
  channel_stamp_mode_text_too_long:
    '⚠️ Teks post terlalu panjang untuk TON. Untuk post ini hanya mode <b>Hanya proof</b> yang tersedia.',
  channel_stamp_mode_text_too_long_short: 'Teks terlalu panjang untuk TON',
  channel_stamp_mode_hash_only_selected: 'Dipilih: hanya proof',
  channel_stamp_mode_hash_text_selected: 'Dipilih: proof + teks',
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
    'TON ब्लॉकचेन पर फ़ाइलों, दस्तावेज़ों और पोस्ट के लिए डिजिटल क्रिप्टोग्राफिक प्रमाणन सेवा।\n\n' +
    '📄 <b>यह कैसे काम करता है:</b>\n' +
    '1) फ़ाइल या पोस्ट भेजें\n' +
    '2) बॉट SHA-256 निकालता है\n' +
    '3) पोस्ट के लिए आप मूल पाठ सेव कर सकते हैं\n' +
    '4) भुगतान: ⭐ Stars या 💎 TON\n' +
    '5) डेटा ब्लॉकचेन में रिकॉर्ड होगा\n' +
    '6) आपको QR+TX के साथ PDF प्रमाणपत्र मिलेगा\n\n' +
    '💡 कमांड:\n' +
    '/start - शुरू करें\n' +
    '/verify - सत्यापित करें\n' +
    '/lang - भाषा\n' +
    '/help - मदद\n' +
    '/cancel - सत्र रीसेट करें',
  help:
    '📖 <b>ProofStamp का उपयोग कैसे करें</b>\n\n' +
    '1) फ़ाइल भेजें\n' +
    '2) भुगतान: ⭐ {starsPrice} Stars या 💎 {tonPrice} TON\n' +
    '3) PDF प्रमाणपत्र प्राप्त करें (QR+TX सहित)\n\n' +
    '🛡️ आपकी फ़ाइलें सेव नहीं की जातीं। सिस्टम में केवल SHA-256 रहता है।\n\n' +
    'बाद में सत्यापन के लिए वही फ़ाइल फिर भेजें और /verify उपयोग करें।',
  help_post_text_feature:
    '📝 ग्रुप और चैनल पोस्ट के लिए आप Proof + टेक्स्ट चुनकर पोस्ट का पूरा मूल पाठ TON में ⭐ {starsPrice} Stars या 💎 {tonPrice} TON में सेव कर सकते हैं।',
  verify_mode: '🔍 फ़ाइल भेजें, मैं जांचूंगा कि क्या यह TON में रिकॉर्ड है।',
  computing_hash: '⏳ प्रोसेसिंग...',
  doc_info: '📄 <b>फ़ाइल:</b> {fileName}\n🔑 <b>SHA-256:</b>\n<code>{hash}</code>',
  choose_payment: 'भुगतान का तरीका चुनें:',
  btn_pay_stars: 'भुगतान करें ⭐ {starsPrice} Stars',
  btn_pay_ton: 'भुगतान करें 💎 {tonPrice} TON',
  btn_verify_payment: '✅ भुगतान किया, सत्यापित करें',
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
  stars_already_paid_help: 'प्रमाणपत्र पूरा करने के लिए "सत्यापित करें" दबाएं।',
  invoice_already_created: 'इनवॉइस पहले ही बनाया जा चुका है।',
  invoice_already_created_help: 'अंतिम इनवॉइस संदेश खोलें और वहीं भुगतान पूरा करें।',
  ton_rate_limited_retry:
    '⏳ TON नेटवर्क व्यस्त है (रेट लिमिट)। भुगतान सेव है। कुछ सेकंड बाद "सत्यापित करें" दबाएं।',
  channel_stamp_btn: 'इस पोस्ट को स्टैम्प करें',
  channel_stamp_ready: '🧾 इस पोस्ट के लिए ProofStamp तैयार है। चैट एडमिन एक टैप में स्टैम्प कर सकता है।',
  channel_stamp_admin_only: 'केवल चैट एडमिन पोस्ट स्टैम्प कर सकते हैं।',
  channel_stamp_not_found: 'पोस्ट संदर्भ नहीं मिला। नई पोस्ट आने पर फिर कोशिश करें।',
  channel_stamp_started: 'स्टैम्पिंग शुरू हो गई...',
  channel_stamp_already_done: 'यह पोस्ट पहले से स्टैम्प की जा चुकी है।',
  channel_stamp_done: '✅ पोस्ट स्टैम्प हो गई और proof प्रकाशित कर दिया गया।',
  channel_stamp_done_with_text: '✅ पोस्ट स्टैम्प हो गई, proof प्रकाशित कर दिया गया और टेक्स्ट TON में सेव हो गया।',
  channel_stamp_disabled: 'चैनल स्टैम्प मोड बंद है।',
  channel_stamp_group_only: 'ग्रुप चैट में /stamp को लक्ष्य संदेश पर reply करके उपयोग करें।',
  channel_stamp_usage_reply: 'लक्ष्य संदेश पर /stamp से reply करें, या एडमिन पोस्ट में {tag} जोड़ें।',
  channel_stamp_payment_intro:
    '🧾 <b>पोस्ट स्टैम्प करें</b>\n' +
    'चैट: <b>{channelTitle}</b>\n' +
    'पोस्ट ID: <code>{postId}</code>\n\n' +
    'इस पोस्ट के नीचे proof प्रकाशित करने के लिए भुगतान करें:\n' +
    '⭐ {starsPrice} Stars या 💎 {tonPrice} TON।',
  channel_stamp_mode_title: '📝 <b>इस पोस्ट के लिए क्या सेव करना है?</b>',
  channel_stamp_mode_hash_only: 'सिर्फ proof',
  channel_stamp_mode_hash_text: 'Proof + टेक्स्ट',
  channel_stamp_mode_hash_only_hint:
    '1) TON में केवल पोस्ट का proof hash सेव करें।\nकीमत: ⭐ {starsPrice} Stars या 💎 {tonPrice} TON।',
  channel_stamp_mode_hash_text_hint:
    '2) TON में पोस्ट का proof और पूरा पोस्ट टेक्स्ट सेव करें।\nकीमत: ⭐ {starsPrice} Stars या 💎 {tonPrice} TON।',
  channel_stamp_mode_text_warning: '⚠️ TON में पोस्ट का टेक्स्ट सार्वजनिक और स्थायी होगा।',
  channel_stamp_mode_text_too_long:
    '⚠️ पोस्ट टेक्स्ट TON के लिए बहुत लंबा है। इस पोस्ट के लिए केवल <b>सिर्फ proof</b> मोड उपलब्ध है।',
  channel_stamp_mode_text_too_long_short: 'टेक्स्ट TON के लिए बहुत लंबा है',
  channel_stamp_mode_hash_only_selected: 'चुना गया: सिर्फ proof',
  channel_stamp_mode_hash_text_selected: 'चुना गया: proof + टेक्स्ट',
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
  btn_cancel: '❌ रद्द करें',
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
    '用于在 TON 区块链上对文件、文档和帖子进行数字加密认证的服务。\n\n' +
    '📄 <b>工作流程：</b>\n' +
    '1) 发送文件或帖子\n' +
    '2) 机器人计算 SHA-256\n' +
    '3) 对于帖子，你可以保存原始文本\n' +
    '4) 支付：⭐ Stars 或 💎 TON\n' +
    '5) 数据将记录到区块链\n' +
    '6) 你将收到带 QR+TX 的 PDF 证书\n\n' +
    '💡 命令：\n' +
    '/start - 开始\n' +
    '/verify - 验证\n' +
    '/lang - 语言\n' +
    '/help - 帮助\n' +
    '/cancel - 重置会话',
  help:
    '📖 <b>如何使用 ProofStamp</b>\n\n' +
    '1) 发送文件\n' +
    '2) 支付：⭐ {starsPrice} Stars 或 💎 {tonPrice} TON\n' +
    '3) 获取 PDF 证书（含 QR+TX）\n\n' +
    '🛡️ 您的文件不会被保存，系统仅保留 SHA-256。\n\n' +
    '稍后验证时，请再次发送同一文件并使用 /verify。',
  help_post_text_feature:
    '📝 对于群组和频道中的帖子，你可以选择 Proof + 文本，并以 ⭐ {starsPrice} Stars 或 💎 {tonPrice} TON 将帖子的完整原始文本保存到 TON。',
  verify_mode: '🔍 <b>验证模式</b>\n发送文件后，我会检查是否已记录到 TON。',
  computing_hash: '⏳ 处理中...',
  doc_info: '📄 <b>文件：</b> {fileName}\n🔑 <b>SHA-256：</b>\n<code>{hash}</code>',
  choose_payment: '请选择支付方式：',
  btn_pay_stars: '支付 ⭐ {starsPrice} Stars',
  btn_pay_ton: '支付 💎 {tonPrice} TON',
  btn_verify_payment: '✅ 已支付，验证',
  btn_cancel: '❌ 取消',
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
  channel_stamp_done_with_text: '✅ 帖子已加盖时间戳，proof 已发布，文本已保存到 TON。',
  channel_stamp_payment_intro:
    '🧾 <b>为帖子加盖时间戳</b>\n' +
    '聊天：<b>{channelTitle}</b>\n' +
    '帖子 ID：<code>{postId}</code>\n\n' +
    '如需在此帖子下发布 proof，请支付：\n' +
    '⭐ {starsPrice} Stars 或 💎 {tonPrice} TON。',
  channel_stamp_mode_title: '📝 <b>要为这条帖子保存什么？</b>',
  channel_stamp_mode_hash_only: '仅保存 proof',
  channel_stamp_mode_hash_text: 'Proof + 文本',
  channel_stamp_mode_hash_only_hint:
    '1) 仅将帖子的 proof 哈希保存到 TON。\n价格：⭐ {starsPrice} Stars 或 💎 {tonPrice} TON。',
  channel_stamp_mode_hash_text_hint:
    '2) 将帖子 proof 和完整帖子文本保存到 TON。\n价格：⭐ {starsPrice} Stars 或 💎 {tonPrice} TON。',
  channel_stamp_mode_text_warning: '⚠️ 帖子文本写入 TON 后将公开且永久保存。',
  channel_stamp_mode_text_too_long:
    '⚠️ 帖子文本对 TON 来说太长了。此帖子仅可使用 <b>仅保存 proof</b> 模式。',
  channel_stamp_mode_text_too_long_short: '帖子文本对 TON 来说太长了',
  channel_stamp_mode_hash_only_selected: '已选择：仅保存 proof',
  channel_stamp_mode_hash_text_selected: '已选择：proof + 文本',
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








