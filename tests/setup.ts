import { _forceLang } from '../src/core/i18n';

// Aplikasi berbahasa Inggris secara bawaan; seluruh tes lama menegaskan teks Indonesia, jadi dipaksa 'id'.
// Tes bahasa Inggris memanggil _forceLang(null) atau _forceLang('en') sendiri.
_forceLang('id');
