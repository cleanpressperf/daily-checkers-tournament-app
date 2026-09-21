export const BOT_NAMES_96 = [
  'Chinedu Okafor', 'Adaeze Nwosu', 'Emeka Obi', 'Ngozi Eze', 'Oluwaseun Adeyemi', 'Aisha Bello', 'Ifeanyi Umeh', 'Zainab Musa',
  'Tunde Balogun', 'Amaka Ibe', 'Yusuf Abdullahi', 'Chioma Okeke', 'Kelechi Nnamani', 'Fatima Sani', 'Babatunde Lawal', 'Nneka Chukwu',
  'Musa Ibrahim', 'Yetunde Akinyemi', 'Obinna Ezeani', 'Halima Garba', 'Femi Adebayo', 'Ezinne Madu', 'Sani Usman', 'Folake Ajayi',
  'Nnamdi Iroha', 'Maryam Shehu', 'Uche Mbata', 'Bisi Oladipo', 'Abdulrahman Umar', 'Ijeoma Nwankwo', 'Dele Ogunleye', 'Hauwa Mohammed',
  'Chukwudi Ani', 'Khadija Aliyu', 'Segun Ojo', 'Adaobi Eze', 'Ibrahim Danjuma', 'Ronke Afolabi', 'Onyekachi Nwafor', 'Safiya Bello',
  'Kayode Olumide', 'Chisom Nwankwo', 'Bashir Adamu', 'Modupe Akinola', 'Ebuka Nwosu', 'Rukayat Lawal', 'Tosin Adebisi', 'Ogechi Okoro',
  'Abubakar Sule', 'Temitope Ogun', 'Somtochukwu Eze', 'Maryam Yusuf', 'Ayo Olaniyan', 'Blessing Udo', 'Usman Kabir', 'Nkiruka Obi',
  'Kunle Fasina', 'Hadiza Ahmed', 'Chidera Nwachukwu', 'Seyi Bamiro', 'Muktar Bello', 'Uzoamaka Ibekwe', 'Wale Adekunle', 'Amina Idris',
  'Ikenna Okafor', 'Bolanle Adebayo', 'Salisu Musa', 'Kamsi Nwosu', 'Lekan Ajayi', 'Asabe Ibrahim', 'Chukwuemeka Obi', 'Titi Balogun',
  'Yahaya Suleiman', 'Adaora Eze', 'Damilola Ojo', 'Rasheed Lawal', 'Nkemdilim Umeh', 'Morenike Akinyemi', 'Yakubu Garba', 'Ifunanya Okeke',
  'Gbenga Alabi', 'Sadiya Umar', 'Chukwuka Madu', 'Esther Nnamani', 'Jibril Sani', 'Omolara Adeyemi', 'Kenechukwu Ibe', 'Ladi Mohammed',
  'Oladimeji Afolabi', 'Chiamaka Nwankwo', 'Abdullahi Bello', 'Mojisola Ogun', 'Ifeoma Chukwu', 'Mustapha Danjuma', 'Ayomide Akinola', 'Nana Eze',
]

export function shuffledBots(count: number) {
  return [...BOT_NAMES_96].sort(() => Math.random() - 0.5).slice(0, count)
}
