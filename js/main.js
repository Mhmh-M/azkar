
let data;
let main_text = document.querySelector(".main-text");
let counter_button = document.querySelector("#counter");
let ziker_number = document.querySelector('#ziker_number')
let totle_ziker = document.querySelector('#totle_ziker')
let box = document.querySelector(".box")
let counter_track = 0;
let ul_links = document.querySelector('header ul');
let icon = document.querySelector('header .icon');
let span_2 = document.querySelector(".icon span:nth-child(2)")
let menu_active = false;
let ziker_name = document.querySelector('#ziker_name');
let azkar_names = ['أذكار الصباح', 'أذكار المساء', 'أذكار الصلاة', 'صيغ التشهد'];

let azkar_alsaba7 = document.querySelector('#azkar_alsaba7');
let azkar_almsa2 = document.querySelector('#azkar_almsa2');
let azkar_alslah = document.querySelector('#azkar_alslah');
let azkar_altshhd = document.querySelector('#azkar_altshhd');
let times = document.querySelector("#times");


icon.addEventListener('click', () => {
  if (!menu_active) {
    menu_active = true
    span_2.classList.add("full-width");
    ul_links.style.display = "block";
  } else {
    menu_active = false
    span_2.classList.remove("full-width");
    ul_links.style.display = "none";
  }
})

data = day_data;
main_text.innerHTML = data[0]['zakr'];
counter_button.innerHTML = data[0]['count'];
totle_ziker.innerHTML = data.length;
ziker_number.innerHTML = counter_track + 1;
ziker_name.innerHTML = azkar_names[0];
times.innerHTML = data[0]['text_count']


let next = document.querySelector("#next");
let back = document.querySelector("#back");

next.addEventListener("click", next_action);
back.addEventListener("click", back_action);
azkar_alsaba7.addEventListener('click', () => { choose_azkar(day_data, 0) });
azkar_almsa2.addEventListener('click', () => { choose_azkar(night_data, 1) });
azkar_alslah.addEventListener('click', () => { choose_azkar(azkat_salah, 2) });
azkar_altshhd.addEventListener('click', () => (choose_azkar(tashahd, 3)));

function choose_azkar(azkar_data, azkar_number) {
  data = azkar_data;
  main_text.innerHTML = data[0]['zakr'];
  counter_button.innerHTML = data[0]['count'];
  totle_ziker.innerHTML = data.length;
  ziker_number.innerHTML = counter_track + 1;
  ziker_name.innerHTML = azkar_names[azkar_number];
  times.innerHTML = data[0]['text_count']


}
function next_action() {
  if (counter_track != data.length - 1) {
    counter_track++
    ziker_number.innerHTML++
  }
  main_text.innerHTML = data[counter_track]['zakr']
  counter_button.innerHTML = data[counter_track]['count']
  times.innerHTML = data[counter_track]['text_count']


}

function back_action() {
  if (counter_track != 0) {
    counter_track--
    ziker_number.innerHTML--
  }
  main_text.innerHTML = data[counter_track]['zakr']
  counter_button.innerHTML = data[counter_track]['count']
  times.innerHTML = data[counter_track]['text_count']


}

counter_button.addEventListener('click', count_action);

function count_action() {

  if (counter_button.innerHTML == 1) {
    next_action()
  } else {
    counter_button.innerHTML--

  }
}

document.addEventListener('DOMContentLoaded', () => {
  box.addEventListener('click', chooseSide);
});

function chooseSide(e) {
  const { clientX } = e;
  const { clientWidth } = box
  if (clientX < (clientWidth / 2)) {
    next_action()
  } else {
    back_action()
  }
}