Employee = (function(){

    // private static field
    var staticVar;

    // class function a.k.a. constructor
    function cls()
    {
        // private instance field
        var name = "";
        var self = this;

        // public instance field
        this.age = 10;

        // private instance method
        function increment()
        {
            // must use self instead of this
            self.age ++;
        }

        // public instance method
        this.getName = function(){
            return cls.capitalize(name);
        };

        this.setName = function(name2){
            name = name2;
        };

        this.increment = function(){
            increment();
        };

        this.getAge = function(){
            return this.age;
        };
    }

    // public static field
    cls.staticVar = 0;

    // public static method
    cls.capitalize = function(name){
        return name.substring(0, 1).toUpperCase() +
            name.substring(1).toLowerCase();
    };

    // private static method
    function createWithName(name)
    {
        var obj = new cls();
        obj.setName(cls.capitalize(name));
        return obj;
    }

    return cls;
})();

john = new Employee();
john.setName("john");

mary = new Employee();
mary.setName("mary");
mary.increment();

alert("John's name: " + john.getName() + ", age==10: "+john.getAge());
alert("Mary's name: " + mary.getName() + ", age==11: "+mary.getAge());