class MotorCycleGears {
    

    constructor() {
        this.currGear = '1';
    }

    function shiftGears(up) {

        // Check if shifting 


        // Shift
        if (up) shiftUp(); else shiftDown();

    };

    function shiftUp() {
        switch(this.currGear) {
            case '1':
                this.currGear = 'N';
                break;
            case 'N':
                this.currGear = '2';
                break;
            case '2':
                this.currGear = '3';
                break;
            case '3':
                this.currGear = '4';
                break;
            case '4':
                this.currGear = '5';
                break;
        }
    }

    function shiftDown() {
        switch(this.currGear) {
            case '5':
                this.currGear = '4';
                break;
            case '4':
                this.currGear = '3';
                break;
            case '3':
                this.currGear = '2';
                break;
            case '2':
                this.currGear = 'N';
                break;
            case 'N':
                this.currGear = '1';
                break;
        }
    }
}