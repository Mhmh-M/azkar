
let data;
let main_text = document.querySelector(".main-text");
let counter_button = document.querySelector("#counter");
let ziker_number = document.querySelector('#ziker_number')
let totle_ziker = document.querySelector('#totle_ziker')
let box = document.querySelector(".box")
let counter_track = 0;
let header = document.querySelector("header");
let ul_links = document.querySelector('header ul');
let icon = document.querySelector('header .icon');
let spans = document.querySelector("header .icon span")
let menu_active = false;
let ziker_name = document.querySelector('#ziker_name');
let azkar_names = ['أذكار الصباح', 'أذكار المساء', 'أذكار الصلاة', 'صيغ التشهد'];

let azkar_alsaba7 = document.querySelector('#azkar_alsaba7');
let azkar_almsa2 = document.querySelector('#azkar_almsa2');
let azkar_alslah = document.querySelector('#azkar_alslah');
let azkar_altshhd = document.querySelector('#azkar_altshhd');
let times = document.querySelector("#times");


icon.addEventListener('click', function (e) {
  e.stopPropagation;
  if (!menu_active) {
    menu_active = true
    header.style.overflow = "visible";
    icon.classList.add("active-icon");
    ul_links.style.display = "block";
    ul_links.classList.add("move-to-left")
  } else {
    menu_active = false
    header.style.overflow = "hidden";
    icon.classList.remove("active-icon");
    ul_links.style.display = "none";
    ul_links.classList.remove("move-to-left")
  }
});

ul_links.onclick = function (e) {
  e.stopPropagation;
}

spans.onclick = function (e) {
  e.stopPropagation
}


document.addEventListener("click", (e) => {
  if (e.target !== icon && e.target !== ul_links && e.target !== spans) {
    if (icon.classList.contains("active-icon")) {
      menu_active = false
      header.style.overflow = "hidden";
      icon.classList.remove("active-icon");
      ul_links.style.display = "none";
      ul_links.classList.remove("move-to-left")
    }
  }
})


document.onkeyup = function (e) {
  if (e.key === "Escape") {
    menu_active = false
    header.style.overflow = "hidden";
    icon.classList.remove("active-icon");
    ul_links.style.display = "none";
    ul_links.classList.remove("move-to-left")
  }
}

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
  ziker_number.innerHTML = 1
  counter_track = 0



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
  document.querySelector("html").addEventListener('click', chooseSide);
});

function chooseSide(e) {
  const { clientX } = e;
  const { clientWidth } = document.querySelector("html")
  if (clientX < (clientWidth / 2)) {
    next_action()
  } else {
    back_action()
  }
}