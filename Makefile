BUILD = ./build
SRC = ./src
SRC_BASE = ./base/src/
TMP = ./build/tmp


all: $(BUILD)/$(NAME).xpi

$(BUILD)/$(NAME).xpi:
	mkdir --parent $(BUILD)
	mkdir --parent $(TMP)
	
	cp -r $(SRC_BASE) $(TMP)
	cp -r $(SRC) $(TMP)
	cd $(SRC); zip -r ../$@ *; cd -
	
clean:
	$(RM) $(BUILD)/$(NAME).xpi
	$(RM) -R $(TMP)
	$(RM) -R $(BUILD)

