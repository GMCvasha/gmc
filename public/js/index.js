function menu()
{
   var menup = document.getElementById("menu");
   var menu_b = document.getElementById("menu_b");
   if (menup.style.display == "flex")
       {
           menup.style.display = "none";
           menu_b.style.display = "block";
       }else{
           menup.style.display = "flex";
           menu_b.style.display = "none";
       }
}
