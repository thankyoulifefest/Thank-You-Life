export type Language = 'vi' | 'en';
export type LetterLanguage = 'vi' | 'en' | 'bilingual';
export type InvitationTone = 'family' | 'rescue' | 'cocreate';
export type RegRole = 'attendee' | 'artist' | 'volunteer';

export const ASSETS = {
  banner: '/assets/aistudio/L__h_i_Khu_r_ng_Ph_p_m_u_2026_6074cd5c.png',
  logo: '/tylf-logo-badge.png',
  craftsImg: '/src/assets/images/forest_crafts_wonder_1795201640961.jpg',
  campfireImg: '/src/assets/images/campfire_music_magic_1795201640102.jpg',
  costumeImg: '/src/assets/images/forest_costume_fairies_1795202205169.jpg',
  rescueImg: '/src/assets/images/animal_rescue_meadow_1795201641159.jpg',
  veganImg: '/src/assets/images/vegan_potluck_meadow_1795202205100.jpg',
  sanctuaryImg: '/src/assets/images/golden_bee_sanctuary_1795201640626.jpg',
  pigeonBanner: '/src/assets/images/magical_pigeon_postbanner_1795202735561.jpg',
};

export interface OrganizerContact {
  name: string;
  nickname: string;
  phoneDisplay: string;
  phoneHref: string;
}

export const ORGANIZER_CONTACTS: OrganizerContact[] = [
  {
    name: 'Thiên Ân',
    nickname: 'Grace',
    phoneDisplay: '+84 946 574 394',
    phoneHref: 'tel:+84946574394',
  },
  {
    name: 'Xuân Thu',
    nickname: 'Rosie',
    phoneDisplay: '+84 866 222 359',
    phoneHref: 'tel:+84866222359',
  },
];

export const FESTIVAL_INFO = {
  name: 'Thank You Life Fest 2026',
  shortName: 'TYLF 2026',
  secretForestCode: 'ILYA',
  secretForestExpansion: 'I Love You All',
  themeVi: 'Khu Rừng Của Phép Màu (ILYA)',
  themeEn: 'The Forest of Magic (ILYA)',
  motto: 'We Are One – Chúng Ta Là Một',
  mantra: 'Thank you Life - I love you All | Cảm ơn Cuộc sống - Yêu thương cho tất cả!',
  dates: '19–20 / 12 / 2026',
  targetStartIso: '2026-12-19T08:30:00+07:00',
  durationVi: '2 Ngày 1 Đêm Dưới Bầu Trời Sao',
  durationEn: '2 Days · 1 Starry Night',
  venueVi: 'Vườn Ong Vàng, Phú Xuyên, Hà Nội',
  venueEn: 'Golden Bee Garden, Phu Xuyen, Hanoi',
  mapsUrl: 'https://maps.app.goo.gl/g2AzzKL7ECdAfK3b9?g_st=ac',
  admissionVi: '100% Miễn Phí Vé Vào Cửa',
  admissionEn: '100% Free Admission',
  fundraisingGoalVnd: 150000000,
  fundraisingGoalFormatted: '150.000.000 VNĐ',
  organizer: 'Thank You Life Network',
  email: 'thankyoulifefest@gmail.com',
  officialSite: 'https://tylf.thankyoulife.net/',
  paypalUrl: 'https://www.paypal.me/hoangthuhien0211',
  googleScriptUrl:
    'https://script.google.com/macros/s/AKfycbx3oir-awvMa08fvv4G4D-JTaJwuoGvO9srHXtE7ABbtGBtyPYNolK2goPDsTQcQkUF/exec',
};

export interface FundAllocationItem {
  id: string;
  percent: number;
  amountVnd: number;
  amountFormatted: string;
  color: string;
  softBg: string;
  titleVi: string;
  titleEn: string;
  detailVi: string;
  detailEn: string;
}

export const FUNDRAISING_ALLOCATION: FundAllocationItem[] = [
  {
    id: 'rescue',
    percent: 30,
    amountVnd: 45000000,
    amountFormatted: '45.000.000 VNĐ',
    color: '#D96B70',
    softBg: '#FDF1F2',
    titleVi: 'Trao Tặng Trung Tâm Cứu Hộ Động Vật',
    titleEn: 'Donation to Animal Rescue Center',
    detailVi:
      'Thức ăn, tiêm phòng, chăm sóc y tế khẩn cấp và cải thiện mái ấm cho các bạn cún, miu tại Trạm Cứu Hộ.',
    detailEn:
      'Direct grant for nutritious food, vaccinations, veterinary care, and safe shelter at Animal Rescue Centers.',
  },
  {
    id: 'location',
    percent: 20,
    amountVnd: 30000000,
    amountFormatted: '30.000.000 VNĐ',
    color: '#2D6A4F',
    softBg: '#EFF6F1',
    titleVi: 'Địa Điểm Sinh Thái (Vườn Ong Vàng)',
    titleEn: 'Location & Eco-Venue Infrastructure',
    detailVi:
      'Bảo dưỡng thảm cỏ, không gian cắm trại an toàn cho trẻ nhỏ, điện nước xanh và khu vệ sinh sinh thái.',
    detailEn:
      'Maintaining safe family meadows, starry-night camping grounds, eco-utilities, and clean garden facilities.',
  },
  {
    id: 'volunteers',
    percent: 20,
    amountVnd: 30000000,
    amountFormatted: '30.000.000 VNĐ',
    color: '#4E89A7',
    softBg: '#EFF5F9',
    titleVi: 'Đội Ngũ Tình Nguyện Viên Phụng Sự',
    titleEn: 'Volunteer Team Support',
    detailVi:
      'Bữa ăn thuần chay ấm áp, lưu trú lều trại, dụng cụ thực địa và điều phối cho đội ngũ phụng sự suốt lễ hội.',
    detailEn:
      'Plant-based meals, overnight camping logistics, field kits, and care for core service volunteers.',
  },
  {
    id: 'operations',
    percent: 20,
    amountVnd: 30000000,
    amountFormatted: '30.000.000 VNĐ',
    color: '#E89F3C',
    softBg: '#FEF6EA',
    titleVi: 'Vận Hành Lễ Hội & Truyền Thông Cộng Đồng',
    titleEn: 'Festival Operation & Marketing',
    detailVi:
      'Vật liệu trang trí tự nhiên (lấy cảm hứng từ tinh thần Waldorf–Steiner), âm thanh ánh sáng sân khấu mở, cây xanh gieo mầm và truyền thông.',
    detailEn:
      'Natural decor (inspired by Waldorf–Steiner harmony), open-stage audio, tree saplings, and community outreach.',
  },
  {
    id: 'artists',
    percent: 10,
    amountVnd: 15000000,
    amountFormatted: '15.000.000 VNĐ',
    color: '#8A63A8',
    softBg: '#F6F1FA',
    titleVi: 'Nghệ Sĩ & Đối Tác Đồng Kiến Tạo',
    titleEn: 'Artists & Co-Creation Partners',
    detailVi:
      'Hỗ trợ di chuyển, họa cụ thủ công trẻ em, nhạc cụ chữa lành và tri ân Đoàn Nghệ Thuật Cộng Đồng.',
    detailEn:
      'Travel stipends, children’s workshop supplies, acoustic gear, and support for Community Art Troupe partners.',
  },
];

export const OFFICIAL_BANK = {
  bankName: 'MB Bank',
  bankFullName: 'Ngân hàng TMCP Quân Đội (MB Bank)',
  bankBin: '970422',
  vietQrCode: 'MB',
  accountNumber: '0975205360',
  accountHolder: 'HOANG THU HIEN',
  accountHolderDisplay: 'Hoàng Thu Hiền',
};

export interface VietnameseBankOption {
  id: string;
  name: string;
  shortName: string;
  bin: string;
  appName: string;
}

export const VIETNAMESE_BANKS: VietnameseBankOption[] = [
  { id: 'mb', name: 'MB Bank (Quân Đội)', shortName: 'MB Bank', bin: '970422', appName: 'MB Bank App' },
  { id: 'vcb', name: 'Vietcombank', shortName: 'VCB', bin: '970436', appName: 'VCB Digibank' },
  { id: 'tcb', name: 'Techcombank', shortName: 'TCB', bin: '970407', appName: 'Techcombank Mobile' },
  { id: 'bidv', name: 'BIDV', shortName: 'BIDV', bin: '970418', appName: 'BIDV SmartBanking' },
  { id: 'ctg', name: 'VietinBank', shortName: 'VietinBank', bin: '970415', appName: 'VietinBank iPay' },
  { id: 'acb', name: 'ACB (Á Châu)', shortName: 'ACB', bin: '970416', appName: 'ACB ONE' },
  { id: 'vpb', name: 'VPBank', shortName: 'VPBank', bin: '970432', appName: 'VPBank NEO' },
  { id: 'tpb', name: 'TPBank', shortName: 'TPBank', bin: '970423', appName: 'TPBank Mobile' },
  { id: 'agri', name: 'Agribank', shortName: 'Agribank', bin: '970405', appName: 'Agribank Plus' },
  { id: 'stb', name: 'Sacombank', shortName: 'Sacombank', bin: '970403', appName: 'Sacombank Pay' },
  { id: 'vib', name: 'VIB', shortName: 'VIB', bin: '970441', appName: 'MyVIB' },
  { id: 'timo', name: 'Timo Digital Bank', shortName: 'Timo', bin: '963388', appName: 'Timo App' },
];

export interface ContributionTier {
  id: string;
  amount: number;
  labelFormatted: string;
  nameVi: string;
  nameEn: string;
  badgeVi: string;
  badgeEn: string;
  impactVi: string;
  impactEn: string;
  giftVi: string;
  giftEn: string;
  accentHex: string;
  recommended?: boolean;
}

export const CONTRIBUTION_TIERS: ContributionTier[] = [
  {
    id: 'seed',
    amount: 111111,
    labelFormatted: '111.111 VNĐ',
    nameVi: 'Hạt Mầm Biết Ơn',
    nameEn: 'Seed of Gratitude',
    badgeVi: 'Mức 01 · Số Thiên Thần',
    badgeEn: 'Tier 01 · Angel Number',
    impactVi: 'Góp phần mang đến những bữa ăn ấm no cho các bạn cún, miu tại Trạm Cứu Hộ và ươm mầm cây xanh.',
    impactEn: 'Provides nourishing meals for rescued dogs & cats and helps plant new saplings at the garden.',
    giftVi: 'Bộ Huy hiệu Khu Rừng Phép Màu ILYA',
    giftEn: 'ILYA Magic Forest Pin Set',
    accentHex: '#4E89A7',
  },
  {
    id: 'flow',
    amount: 555555,
    labelFormatted: '555.555 VNĐ',
    nameVi: 'Dòng Chảy Yêu Thương',
    nameEn: 'Flow of Love',
    badgeVi: 'Mức 02 · Phổ Biến Nhất',
    badgeEn: 'Tier 02 · Most Chosen',
    impactVi: 'Hỗ trợ y tế, tiêm phòng cho các bé cứu hộ đồng thời chung tay nuôi dưỡng sân khấu mở & trạm sáng tạo miễn phí.',
    impactEn: 'Funds animal medical care while keeping all family crafts, music stages, and vegan circles 100% free.',
    giftVi: 'Set quà hữu cơ Vườn Ong Vàng + Bộ Huy hiệu',
    giftEn: 'Golden Bee Garden Organic Gift Set + Pin Set',
    accentHex: '#E89F3C',
    recommended: true,
  },
  {
    id: 'unity',
    amount: 1111111,
    labelFormatted: '1.111.111 VNĐ',
    nameVi: 'Đại Thụ Hợp Nhất',
    nameEn: 'Tree of Unity',
    badgeVi: 'Mức 03 · Bảo Hộ Trọn Vẹn',
    badgeEn: 'Tier 03 · Full Sanctuary',
    impactVi: 'Đồng hành xây dựng mái ấm an toàn tại Trung Tâm Cứu Hộ và nâng đỡ Đoàn Nghệ Thuật Cộng Đồng.',
    impactEn: 'Co-builds safe animal sanctuaries and powers the Thank You Life Community Art Troupe.',
    giftVi: 'Bộ quà nông sản hữu cơ cao cấp Vườn Ong Vàng + Bộ Huy hiệu',
    giftEn: 'Premium Golden Bee Garden Organic Box + Pin Set',
    accentHex: '#D96B70',
  },
];

export interface FestivalZone {
  number: string;
  accentHex: string;
  softBg: string;
  image?: string;
  tagVi: string;
  tagEn: string;
  titleVi: string;
  titleEn: string;
  highlightVi: string;
  highlightEn: string;
  bodyVi: string;
  bodyEn: string;
}

export const FESTIVAL_ZONES: FestivalZone[] = [
  {
    number: '01',
    accentHex: '#E89F3C',
    softBg: '#FEF7EC',
    image: ASSETS.craftsImg,
    tagVi: 'Vườn Ong Vàng · Lấy cảm hứng Waldorf–Steiner',
    tagEn: 'Golden Bee · Waldorf–Steiner Inspired',
    titleVi: 'Kỹ Năng Sống & Giáo Dục Tự Nhiên',
    titleEn: 'Lifeskill & Natural Education Workshops',
    highlightVi: 'Trẻ em & Cha mẹ · Chạm vào sự mộc mạc',
    highlightEn: 'Parents & Kids · Natural Joy',
    bodyVi:
      'Cùng Vườn Ong Vàng khám phá thế giới tự nhiên qua chuỗi hoạt động vui chơi và học tập đầy cảm hứng: hóa thân thành lính cứu hỏa, vượt chướng ngại vật, trò chơi dân gian, khám phá nông trại, chăm sóc các bạn động vật. Gia đình còn tự do sáng tạo thủ công (lấy cảm hứng từ giáo dục Waldorf–Steiner, hoàn toàn tự nguyện không gò bó), học kỹ năng sống, yoga và thiền chánh niệm.',
    bodyEn:
      'Explore farm adventures with Golden Bee Garden: role-play firefighters, obstacle trails, Vietnamese folk games, animal care, optional organic crafts inspired by Waldorf–Steiner warmth, lifeskill play, yoga, and family mindfulness.',
  },
  {
    number: '02',
    accentHex: '#4E89A7',
    softBg: '#EFF6FA',
    image: ASSETS.campfireImg,
    tagVi: 'Mọi lứa tuổi · Đồng kiến tạo tự do',
    tagEn: 'All Ages · Open Co-Creation',
    titleVi: 'Sân Khấu Nghệ Thuật & Âm Nhạc Mở',
    titleEn: 'Open Art & Healing Music Stage',
    highlightVi: 'Âm nhạc không khoảng cách bên bếp lửa',
    highlightEn: 'No Barrier Between Artist & Audience',
    bodyVi:
      'Không gian âm nhạc chữa lành không khoảng cách giữa nghệ sĩ và khán giả. Nơi tiếng đàn guitar acoustic, sáo trúc, trống djembe, handpan, sound healing và những vũ điệu tự do hòa quyện bên bếp lửa trại để ca ngợi cuộc sống. Bất kỳ ai cũng có thể bước lên sân khấu chia sẻ giai điệu từ trái tim mình.',
    bodyEn:
      'A barrier-free healing music sanctuary where acoustic guitar, bamboo flute, djembe, handpan, sound healing, and joyful dance weave together beside the evening campfire—anyone is welcome to share a song from the heart.',
  },
  {
    number: '03',
    accentHex: '#D96B70',
    softBg: '#FDF2F3',
    image: ASSETS.costumeImg,
    tagVi: 'Gia đình & Trẻ em · Hóa trang tự do',
    tagEn: 'Families · Free-Spirit Dress-Up',
    titleVi: 'Lễ Hội Hóa Trang “Khu Rừng Phép Màu ILYA”',
    titleEn: 'Enchanted Forest “ILYA” Costume Festival',
    highlightVi: 'Gia đình & Trẻ em · Bật mí mật mã ILYA',
    highlightEn: 'Families & Kids · Discover the Secret of ILYA',
    bodyVi:
      'Khuyến khích mọi người chuẩn bị trang phục hóa trang từ vật liệu tự nhiên, tái chế hoặc hóa thân thành bất kỳ nhân vật cổ tích, thần rừng, nàng tiên ong nào bạn yêu thích. Hãy sống trọn vai nhân vật trong khu rừng ILYA (“I Love You All” — bí mật luôn bật mí đúng lúc!) và trao nhau câu thần chú: “Thank You Life – I love you All!”.',
    bodyEn:
      'Wear eco-friendly costumes crafted from natural or recycled treasures—transforming into forest spirits, fairies, and honeybees inside ILYA Forest (a secret standing for “I Love You All”!) while greeting friends with “Thank You Life – I love you All!”.',
  },
  {
    number: '04',
    accentHex: '#2D6A4F',
    softBg: '#EFF6F1',
    image: ASSETS.sanctuaryImg,
    tagVi: 'Kết nối Đất Mẹ · Dấu ấn xanh',
    tagEn: 'Earth Gratitude · Living Legacy',
    titleVi: 'Nghi Thức Gieo Mầm & Trồng Cây Xanh',
    titleEn: 'Tree Planting & Earth Care Ritual',
    highlightVi: 'Mỗi mầm cây là một lời tri ân',
    highlightEn: 'Every Sapling Is a Living Promise',
    bodyVi:
      'Các gia đình và em nhỏ cùng nhau tự tay ươm trồng những mầm cây xanh mới ngay tại khuôn viên Vườn Ong Vàng. Mỗi cái cây được trồng xuống là một lời cam kết yêu thương, góp phần phủ xanh trái đất và để lại món quà sự sống dịu dàng cho thế hệ tương lai.',
    bodyEn:
      'Parents and children plant young trees hand-in-hand across Golden Bee Garden—a tangible promise of care that cools our earth and leaves living shade for future generations.',
  },
  {
    number: '05',
    accentHex: '#C86D51',
    softBg: '#FCF2EE',
    image: ASSETS.veganImg,
    tagVi: '100% Thuần Chay · Không Rác Thải Nhựa',
    tagEn: '100% Plant-Based · Zero Single-Use Plastic',
    titleVi: 'Bữa Ăn Thuần Chay Sẻ Chia (Vegan Potluck)',
    titleEn: 'Community Vegan Potluck Circle',
    highlightVi: 'Hương vị an lành trên thảm cỏ',
    highlightEn: 'Wholesome Shared Meals on the Lawn',
    bodyVi:
      'Những bữa ăn thanh lành, giàu dinh dưỡng được chuẩn bị từ nông sản hữu cơ địa phương và sự đóng góp sẻ chia (potluck) từ chính các gia đình tham dự. Chúng ta cùng quây quần trên thảm cỏ xanh, thưởng thức hương vị thuần khiết của đất trời và thực hành lối sống thuận tự nhiên.',
    bodyEn:
      'Nourishing local organic dishes alongside joyful family potluck creations shared picnic-style on sunlit lawns—practicing compassion for all living beings and zero single-use plastics.',
  },
  {
    number: '06',
    accentHex: '#8A63A8',
    softBg: '#F6F1FA',
    image: ASSETS.rescueImg,
    tagVi: 'Trạm Cứu Hộ · 30% Quỹ Đồng Hành',
    tagEn: 'Animal Rescue · 30% Direct Grant',
    titleVi: 'Góc Yêu Thương & Nhận Nuôi Thú Cưng',
    titleEn: 'Animal Rescue & Adoption Corner',
    highlightVi: 'Kết nối mái ấm trọn đời cho cún miu',
    highlightEn: 'Forever Homes & Compassion Learning',
    bodyVi:
      'Khu vực giao lưu đặc biệt với sự hiện diện của đại diện các Trạm Cứu Hộ Động Vật cùng những bạn cún, miu đáng yêu đã được chăm sóc khỏe mạnh. Đây là cơ hội để các em nhỏ học bài học về lòng trắc ẩn, và là cầu nối giúp những người bạn bốn chân tìm thấy một mái ấm gia đình trọn đời.',
    bodyEn:
      'Meet dedicated Animal Rescue Station teams and healthy rescued dogs and cats ready for adoption—giving children heartfelt lessons in empathy while helping four-legged friends find forever families.',
  },
];

export interface ScheduleSlot {
  time: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  highlight?: boolean;
}

export const SCHEDULE_DAY_1: ScheduleSlot[] = [
  {
    time: '08:30 – 10:00',
    titleVi: 'Đón Chào & Hóa Trang Bước Vào Rừng Phép Màu ILYA',
    titleEn: 'Welcome & Enchanted ILYA Forest Dress-Up',
    descVi: 'Các gia đình tập kết tại Vườn Ong Vàng, check-in, hóa trang nhân vật cổ tích và hạ trại dưới tán cây.',
    descEn: 'Families arrive at Golden Bee Garden, check in, put on forest costumes, and pitch tents under the trees.',
  },
  {
    time: '10:00 – 11:00',
    titleVi: 'Vòng Tròn Khai Mở “We Are One” & Ra Mắt Đoàn Nghệ Thuật',
    titleEn: 'Opening Unity Circle & Community Art Troupe Debut',
    descVi: 'Nghi thức chào mặt trời, hòa nhịp thần chú “Thank You Life – I love you All” và ra mắt Đoàn Nghệ Thuật Cộng Đồng.',
    descEn: 'Morning gratitude circle and the official launch of the Thank You Life Community Art Troupe.',
  },
  {
    time: '11:00 – 14:30',
    titleVi: '6 Trạm Sáng Tạo Tự Do & Bữa Trưa Thuần Chay Sẻ Chia',
    titleEn: 'Creative Zones & Community Vegan Potluck',
    descVi: 'Kỹ năng sống, vẽ màu nước cảm hứng Waldorf, thăm góc thú cưng cứu hộ và cùng thưởng thức tiệc chay dưới tán cây.',
    descEn: 'Lifeskills, Waldorf-inspired crafts, animal rescue corner, and shared plant-based lunch on the meadow.',
  },
  {
    time: '14:30 – 17:00',
    titleVi: 'Sân Khấu Mở Buổi Chiều & Nghi Thức Trồng Cây Hoàng Hôn',
    titleEn: 'Afternoon Open Stage & Sunset Tree Planting',
    descVi: 'Âm nhạc acoustic, handpan, trò chơi dân gian và các gia đình cùng gieo mầm xanh tri ân Đất Mẹ.',
    descEn: 'Acoustic music, handpan, folk games, and family tree planting in golden hour light.',
  },
  {
    time: '19:30 – 21:00',
    titleVi: 'Đêm Lửa Trại Hợp Nhất & Âm Nhạc Chữa Lành',
    titleEn: 'Unity Campfire Symphony & Healing Circle',
    descVi: 'Khoảnh khắc linh thiêng quanh bếp lửa hồng dưới bầu trời sao Phú Xuyên—hòa giọng hát, chơi nhạc cụ và kết nối trái tim.',
    descEn: 'Sacred evening around the crackling fire under starry skies with communal song and sound healing.',
    highlight: true,
  },
  {
    time: '21:00 – 22:00+',
    titleVi: 'Tĩnh Lặng Biết Ơn & Cắm Trại Dưới Bầu Trời Sao',
    titleEn: 'Evening Gratitude & Starry Night Camping',
    descVi: 'Chia sẻ lời cầu nguyện bình an tới muôn loài, dọn dẹp không gian xanh và nghỉ đêm trong lều ấm.',
    descEn: 'Quiet gratitude prayers for all beings followed by peaceful overnight camping.',
  },
];

export const SCHEDULE_DAY_2: ScheduleSlot[] = [
  {
    time: '06:30 – 08:00',
    titleVi: 'Thức Giấc Cùng Thiên Nhiên: Yoga, Khí Công & Thiền',
    titleEn: 'Sunrise Yoga, Qigong & Mindful Meditation',
    descVi: 'Đón ánh nắng ban mai đầu tiên tại Vườn Ong Vàng với bài hít thở nhẹ nhàng và thanh lọc không gian.',
    descEn: 'Greet the morning sun across the dew-kissed meadow with gentle movement and breathwork.',
  },
  {
    time: '08:00 – 09:30',
    titleVi: 'Bữa Sáng Thanh Lành & Trà Thảo Mộc Vườn Ong Vàng',
    titleEn: 'Mindful Vegan Breakfast & Herbal Tea',
    descVi: 'Thưởng thức trà thảo mộc ấm áp và bữa sáng thuần chay tự nhiên cùng các gia đình.',
    descEn: 'Warm garden herbal teas paired with wholesome homemade vegan breakfast.',
  },
  {
    time: '09:30 – 12:00',
    titleVi: 'Đồng Kiến Tạo Tự Do Trong Dòng Chảy “We Are One”',
    titleEn: 'Free-Flow Co-Creation & Community Workshops',
    descVi: 'Các trạm nghệ thuật, âm nhạc và kết nối cộng đồng diễn ra tự nhiên theo nhịp điệu của mọi người.',
    descEn: 'Open-ended art making, storytelling, and spontaneous community collaborations.',
  },
  {
    time: '12:00 – 14:00',
    titleVi: 'Bữa Trưa Đoàn Viên Thuần Chay (Final Unity Potluck)',
    titleEn: 'Final Unity Vegan Potluck',
    descVi: 'Bữa cơm sẻ chia ấm áp trước khi khép lại hành trình 48 giờ.',
    descEn: 'Warm shared closing meal celebrating new friendships formed in the forest.',
  },
  {
    time: '14:00 – 15:30',
    titleVi: 'Vòng Tròn Hợp Nhất Tri Ân & Công Bố Quỹ 150 Triệu',
    titleEn: 'Closing Gratitude Circle & Fund Transparency',
    descVi: 'Hòa vang lời cảm ơn cuộc sống, chia sẻ kết quả gây quỹ bảo trợ động vật và giữ gìn vườn sạch nguyên vẹn khi ra về.',
    descEn: 'Closing blessing circle, transparent fund update, and Leave-No-Trace garden farewell.',
    highlight: true,
  },
];

export interface FaqItem {
  id: string;
  qVi: string;
  qEn: string;
  aVi: string;
  aEn: string;
}

export const FESTIVAL_FAQS: FaqItem[] = [
  {
    id: 'free-entry',
    qVi: '1. Lễ hội có thực sự miễn phí vé vào cửa không?',
    qEn: '1. Is Thank You Life Fest 2026 truly 100% free admission?',
    aVi: 'Có! Thank You Life Fest 2026 mở cửa 100% miễn phí cho mọi gia đình và trẻ nhỏ. Chúng mình chào đón mọi sự đóng góp tùy hỷ (gợi ý 111.111 VNĐ – 1.111.111 VNĐ) hướng tới mục tiêu quỹ cộng đồng 150.000.000 VNĐ: trong đó 30% trao thẳng tới các Trung Tâm Cứu Hộ Động Vật, 20% Địa điểm Vườn Ong Vàng, 20% Tình nguyện viên, 20% Vận hành lễ hội & Truyền thông, và 10% Nghệ sĩ đồng kiến tạo.',
    aEn: 'Yes! Admission is 100% free for every family and child. We warmly welcome optional contributions (suggested 111,111 – 1,111,111 VNĐ) toward our 150,000,000 VNĐ transparent goal: 30% donated directly to Animal Rescue Centers, 20% Eco-Venue, 20% Volunteers, 20% Festival Operation & Marketing, and 10% Artists & Partners.',
  },
  {
    id: 'camping-prep',
    qVi: '2. Gia đình có trẻ nhỏ tham gia cắm trại qua đêm cần chuẩn bị những gì?',
    qEn: '2. What should families with young kids bring for overnight camping?',
    aVi: 'Tháng 12 Hà Nội se lạnh về đêm nên gia đình nhớ mang áo ấm, tất ấm, lều trại cá nhân (hoặc đăng ký thuê lều ngay trong form), bình nước cá nhân, đèn pin nhỏ và đặc biệt là trang phục hóa trang tự do bước vào Khu Rừng Phép Màu ILYA (“I Love You All”).',
    aEn: 'December nights in Hanoi are crisp, so please bring warm layers, a personal tent (or rent one via the sign-up form), reusable water bottles, a flashlight, and creative nature-inspired costumes for ILYA (“I Love You All”) Magic Forest!',
  },
  {
    id: 'vegan-food',
    qVi: '3. Quy định về ăn uống và phong cách Waldorf–Steiner tại lễ hội như thế nào?',
    qEn: '3. What are the food guidelines, and do we have to follow Waldorf–Steiner strictly?',
    aVi: 'Lễ hội thực hành 100% thuần chay (plant-based) và không rác thải nhựa dùng một lần để tôn vinh tinh thần “Live and Let Live”. Về yếu tố Waldorf–Steiner, khu vườn chỉ lấy cảm hứng nhẹ nhàng từ sự mộc mạc, màu sắc ấm áp và tôn trọng nhịp điệu tự nhiên của trẻ thơ—hoàn toàn tự do, không gò bó hay bắt buộc phải theo khuôn mẫu nào.',
    aEn: 'The sanctuary practices 100% plant-based (vegan) dining and zero single-use plastics in honor of “Live and Let Live.” As for Waldorf–Steiner aesthetics, it serves purely as gentle inspiration for our natural crafts and colors—there are zero strict rules or mandatory routines to follow.',
  },
  {
    id: 'pets-adoption',
    qVi: '4. Chúng mình có thể đưa thú cưng đi cùng hoặc nhận nuôi cún miu tại lễ hội không?',
    qEn: '4. Can we bring family pets or adopt rescued dogs and cats at the festival?',
    aVi: 'Tại lễ hội có riêng Góc Yêu Thương của các Trạm Cứu Hộ Động Vật để gia đình giao lưu và đăng ký nhận nuôi các bạn cún, miu đã tiêm phòng khỏe mạnh (theo quy trình phỏng vấn & cam kết của Trạm). Nếu đưa thú cưng của gia đình đi cùng, vui lòng luôn giữ dây dắt an toàn và vệ sinh chung cho thảm cỏ Vườn Ong Vàng.',
    aEn: 'Yes! Visit the Animal Rescue Corner to meet healthy vaccinated dogs and cats awaiting loving forever homes (with responsible adoption screening). Family pets are also welcome on secure leashes while keeping the garden clean.',
  },
  {
    id: 'transport',
    qVi: '5. Làm thế nào để di chuyển đến Vườn Ong Vàng (Phú Xuyên, Hà Nội)?',
    qEn: '5. How do we get to Golden Bee Garden (Phu Xuyen, Hanoi)?',
    aVi: 'Vườn Ong Vàng nằm tại huyện Phú Xuyên, phía Nam Hà Nội (cách trung tâm khoảng 35–40km, đi theo cao tốc Pháp Vân – Cầu Giẽ hoặc Quốc lộ 1A cũ, khoảng 45–60 phút). Sau khi đăng ký qua form bên dưới, Ban Tổ Chức cũng hỗ trợ kết nối nhóm đi chung xe (carpool) cho các gia đình.',
    aEn: 'Golden Bee Garden is in Phu Xuyen District (~35–40km south of central Hanoi, 45–60 mins via Phap Van – Cau Gie Expressway or National Route 1A). Open our Google Maps link directly, or join our organizer carpool group after registering!',
  },
];

export interface TonePreset {
  id: InvitationTone;
  labelVi: string;
  labelEn: string;
  defaultRecipientVi: string;
  defaultRecipientEn: string;
  defaultBlessingVi: string;
  defaultBlessingEn: string;
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'family',
    labelVi: 'Mời Gia Đình & Bạn Bè',
    labelEn: 'Family & Friends',
    defaultRecipientVi: 'Những người bạn thương mến',
    defaultRecipientEn: 'Dear friends and loved ones',
    defaultBlessingVi:
      'Mình muốn rủ bạn cùng gia đình ghé Khu Rừng Phép Màu ILYA (“I Love You All”) dịp cuối tuần 19–20/12 tại Vườn Ong Vàng để hít thở thiên nhiên, trải nghiệm thủ công sắc màu, trồng cây xanh và góp một hạt mầm yêu thương cho quỹ 150 triệu đồng.',
    defaultBlessingEn:
      'I would love to invite you and your family to spend Dec 19–20 inside ILYA Magic Forest at Golden Bee Garden—painting outdoors, planting trees, sharing vegan meals under the stars, and supporting our 150M VNĐ rescue & co-creation fund.',
  },
  {
    id: 'rescue',
    labelVi: 'Kêu Gọi Quỹ Cứu Trợ',
    labelEn: 'Animal Rescue Call',
    defaultRecipientVi: 'Những trái tim yêu thương muôn loài',
    defaultRecipientEn: 'Dear compassionate hearts',
    defaultBlessingVi:
      'TYLF 2026 mở cửa hoàn toàn miễn phí và đang chung tay gây quỹ 150.000.000 VNĐ (với 30% trao thẳng Trung Tâm Cứu Hộ Động Vật cùng nguồn lực nuôi dưỡng lễ hội xanh phi lợi nhuận). Dù ở xa hay tham dự trực tiếp, mỗi đóng góp đều là phép màu.',
    defaultBlessingEn:
      'TYLF 2026 offers 100% free admission while raising 150,000,000 VNĐ (30% dedicated directly to Animal Rescue Centers alongside eco-venue, volunteer, and artist support). Every contribution creates a miracle.',
  },
  {
    id: 'cocreate',
    labelVi: 'Mời Nghệ Sĩ & Tình Nguyện',
    labelEn: 'Artists & Volunteers',
    defaultRecipientVi: 'Người đồng kiến tạo thân thương',
    defaultRecipientEn: 'Dear fellow co-creator',
    defaultBlessingVi:
      'Hãy mang âm nhạc, workshop sáng tạo tự nhiên hoặc đôi tay phụng sự của bạn đến Vườn Ong Vàng để cùng ra mắt Đoàn Nghệ Thuật Cộng Đồng Thank You Life và thắp sáng khu rừng ILYA bên đêm lửa trại "We Are One".',
    defaultBlessingEn:
      'Bring your music, nature workshops, or volunteer spirit to Golden Bee Garden as we launch the Thank You Life Community Art Troupe and light up ILYA Forest around the "We Are One" campfire.',
  },
];
