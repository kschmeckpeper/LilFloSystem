/**
 * \file
 * Running the matrices on flo faces
 *
 * \copyright &copy; PCI 2017. All rights reserved
 */

#include "src/FloFace/src/FloFace.h"
#include "src/serial_coms/arduino/SerialCom/src/SerialCom.h" // https://github.com/Rehab-Robotics-Lab/serial_coms

FloFace floFace = FloFace(0x72, 0x71, 0x70, 1, 1, 3
);

void process_incoming(char* data, int length);
SerialCom communicator = SerialCom(process_incoming);
bool mouth[168];
bool leye[64];
bool reye[64];
int bright;


void setup()
{
    communicator.init();
    floFace.init();
    char send[] = "Done with init";
    communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    bright=1;
}

void loop()
{
    communicator.update();

    /*Brightness Test*/
    /*Works flawlessly, exactly as expected:*/
    /*floFace.SetMouthBrightness(bright);*/
    /*floFace.SetLeftEyeBrightness(bright);*/
    /*floFace.SetRightEyeBrightness(bright);*/
    /*delay(500);*/
    /*bright=bright+1;*/
    /*if(bright>15){bright=1;}*/
}
/**
 * 1) check first byte for what we are lighting up
 * 2) remaining bits are on off values for the matrices, so draw them...
 */
void process_incoming(char* data, int length){
    if(data[0]==0){
        for(int i = 0; i<168; i++){
            mouth[i] = (data[1 + i/8] >> (7 - i%8)) & 1;
        }
        floFace.DrawMouth(mouth);
        char send[] = "Set new face";
        communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    }else if(data[0]==1){
        for(int i = 0; i<64; i++){
            leye[i] = (data[1 + i/8] >> (7 - i%8)) & 1;
        }
        floFace.DrawLeftEye(leye);
        char send[] = "Set new left eye";
        communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    }else if(data[0]==2){
        for(int i = 0; i<64; i++){
            reye[i] = (data[1 + i/8] >> (7 - i%8)) & 1;
        }
        floFace.DrawRightEye(reye);
        char send[] = "Set new righ eye";
        communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    }else if(data[0]==3){
        // valid levels 1-15
        int targetBrightness=data[1];
        floFace.SetMouthBrightness(targetBrightness);
        char send[40];
        sprintf(send,"Set mouth brightness to: %i",targetBrightness);
        communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    }else if(data[0]==4){
        int targetBrightness=data[1];
        floFace.SetLeftEyeBrightness(targetBrightness);
        char send[40];
        sprintf(send,"Set left eye brightness to: %i",targetBrightness);
        communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    }else if(data[0]==5){
        int targetBrightness=data[1];
        floFace.SetRightEyeBrightness(targetBrightness);
        char send[40];
        sprintf(send,"Set right eye brightness to: %i",targetBrightness);
        communicator.sendData(send, sizeof(send)/sizeof(send[0]));
    }
}
