########################################################################
# createDataList.R
#
# Databrowser specific creation of dataframes for inclusion in dataList.
#
# Author: Jonathan Callahan
########################################################################

createDataList <- function(infoList) {
  
  # Create dataList
  if (infoList$plotType == "Map") {
    dataList <- list(stateData = read.csv(paste(infoList$dataDir,'stateData.csv', sep='')), stringsAsFactors = FALSE)
  } else {
    dataList <- list()
  }

  return(dataList)
}

