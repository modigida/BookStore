document.addEventListener("DOMContentLoaded", function () {
    const mapIframe = document.getElementById("map-iframe");
    const mapPlaceholder = document.getElementById("map-placeholder");

    mapIframe.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8116.681830440664!2d11.933715393555558!3d57.723138949699535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x464ff37d09992e71%3A0xc0ad9f1a5ec2c4e5!2sBjursl%C3%A4tts%20Torg%2C%20417%2025%20G%C3%B6teborg!5e0!3m2!1ssv!2sse!4v1700000000000";
    
    setTimeout(() => {
        mapIframe.style.display = "block";
    }, 500); 
});
