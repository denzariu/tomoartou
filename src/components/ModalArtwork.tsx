import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Modalize } from 'react-native-modalize'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

type ModalArtworkProps = {
  currentItem: any,
  OFFSET: number,
  currentTheme: any,
  open: boolean,
  setOpen: any
}
const ModalArtwork = ({currentItem, OFFSET, currentTheme, open, setOpen}: ModalArtworkProps) => {

  const iiif_url = 'https://www.artic.edu/iiif/2/';
  const size_url = '/full/400,/0/default.jpg';
  const larger_size_url = '/full/843,/0/default.jpg';
  const windowHeight = Dimensions.get('window').height;

  const modalizeRef = useRef<Modalize>(null);

  const [isEnlarged, setEnlarged] = useState<boolean>(false)
  const [canBeEnlarged, setCanBeEnlarged] = useState<boolean>(false)
  const [artworkImageLink, setArtworkImageLink] = useState<any>([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}, {uri: (iiif_url + currentItem?.image_id + larger_size_url), width: 200, height: 200}])

  useEffect (() => {
    console.log('Modal opened?', open)
    if (open) { 
      if (1.85 * currentItem?.thumbnail?.width < currentItem?.thumbnail?.height)
        setCanBeEnlarged(true)
      else 
        setCanBeEnlarged(false)
      setArtworkImageLink([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}, {uri: (iiif_url + currentItem?.image_id + larger_size_url), width: 200, height: 200}])
      try {
        modalizeRef.current?.open()
      } catch (e) {console.log(e)}
    }
    // else {
    //   modalizeRef.current?.close
    // }
  }, [open])

  const styles = StyleSheet.create({
    modalHeader: {
      // width: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderTopLeftRadius: currentTheme.spacing.m,
      borderTopRightRadius: currentTheme.spacing.m,
    },
    
    modalSection: {
      backgroundColor: currentTheme.colors.background,
      // borderRadius: 12,
      color: currentTheme.colors.primary,
      fontSize: currentTheme.fontSize.xl,
      // fontWeight: 'bold',
      paddingBottom: currentTheme.spacing.s,
    },

    modalTitle: {
      fontFamily: currentTheme.fontFamily.butler,
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.xxl,
      // fontWeight: 'bold',
      paddingTop: currentTheme.spacing.m,
      paddingBottom: currentTheme.spacing.s,
      paddingHorizontal: currentTheme.spacing.page
    },

    modalAuthor: {
      alignSelf: 'flex-start',
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.m,
      fontWeight: 'bold',
      paddingVertical: currentTheme.spacing.s,
      marginHorizontal: currentTheme.spacing.page,
      paddingHorizontal: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: currentTheme.spacing.m,
      width: 'auto'
    },
    
    modalDetails: {
      color: currentTheme.colors.primary,
      fontSize: currentTheme.fontSize.m,
      fontWeight: '300',
      paddingBottom: currentTheme.spacing.m,
    },

    modalCirca: {
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.s,
      fontWeight: '400',
      paddingVertical: currentTheme.spacing.s,
      // marginHorizontal: currentTheme.spacing.page,
      // paddingHorizontal: currentTheme.spacing.m,
      // backgroundColor: currentTheme.colors.primary,
      // borderRadius: currentTheme.spacing.m,
      // width: 'auto'
    },

    modalImageEnlarge: {
      zIndex: 201,
      padding: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: currentTheme.spacing.m
    },
    
    modalButton: {
      position: 'absolute',
      // bottom:0,
      top: currentTheme.spacing.m, 
      right: currentTheme.spacing.page, 
      // padding: 8, 
      // backgroundColor: 'red', 
      zIndex: 200
    },

    modalDescription: {
      // letterSpacing: 0.3,
      fontFamily: currentTheme.fontFamily.butler, //Test if this is better than default Roboto font
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.m,
      lineHeight: 20,
      textAlign: 'justify',
      fontWeight: '300',
      paddingHorizontal: currentTheme.spacing.page,
    },

    modalDescriptionFirst: {
      fontFamily: currentTheme.fontFamily.butler_stencil,
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.xxxl,
      lineHeight: 20,
      textAlign: 'justify',
      // fontWeight: '300',
      paddingTop: currentTheme.spacing.xl,
      paddingHorizontal: currentTheme.spacing.page,
    }
  })

  const renderContent = () => [
    <View key="0">
      <View style={styles.modalHeader}>
        {canBeEnlarged ?
          <View style={styles.modalButton}>
            <TouchableOpacity 
              onPress={() => {setEnlarged(!isEnlarged)}}
              style={styles.modalImageEnlarge}
            >
              {isEnlarged ?
                <MaterialCommunityIcons name="focus-field-horizontal" color={currentTheme.colors.foreground} size={24} />
                :
                <MaterialCommunityIcons name="image-size-select-large" color={currentTheme.colors.foreground} size={24} />
              }
            </TouchableOpacity>
          </View>
          :
          <></>
        }
        <View style={styles.modalSection}>
          <Animated.Image
            source={artworkImageLink}
            onError={() => setArtworkImageLink([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}])}
            style={[{width: '100%', alignSelf: 'center'}, isEnlarged ? {} : {maxHeight: windowHeight * 0.77}, currentItem?.thumbnail ? {aspectRatio: currentItem.thumbnail.width / currentItem.thumbnail.height} : {}]}
          />
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.modalTitle}>{currentItem?.title}</Text>
          </View>
            <View style={{flexDirection: 'row', paddingHorizontal: currentTheme.spacing.page}}>
              {currentItem?.classification_title ?
              <Text style={styles.modalDetails} numberOfLines={1}>{currentItem?.classification_title[0]?.toUpperCase() + currentItem?.classification_title?.slice(1)}</Text>  
              :
              <></>
              }
              {currentItem?.dimensions_detail ?
              <Text style={styles.modalDetails} numberOfLines={1}>  ●  {currentItem?.dimensions_detail[0]?.width_cm} cm × {currentItem?.dimensions_detail[0]?.height_cm} cm</Text>  
              :
              <></>
              }
              
            </View>
          
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.modalAuthor}>{currentItem?.artist_title? currentItem.artist_title : "Not specified"}</Text>
            <Text style={styles.modalCirca}>{currentItem?.date_display}</Text>
          </View>
          {currentItem?.description ?
            <Text style={styles.modalDescriptionFirst}>{currentItem?.description ? currentItem.description[0] : ''}
              <Text style={styles.modalDescription} numberOfLines={1}>{currentItem?.description?.slice(1)}</Text>
            </Text>
            :
            <></>
          }
        </View>
      </View>
    </View>
  ]

  // const handleArtworkOpenPress = () => {
  //   if (2.2 * currentItem?.thumbnail?.width < currentItem?.thumbnail?.height)
  //     setCanBeEnlarged(true)
  //   else 
  //     setCanBeEnlarged(false)
  //   setArtworkImageLink([{uri: (iiif_url + currentItem?.image_id + size_url), width: 100, height: 100}, {uri: (iiif_url + currentItem?.image_id + larger_size_url), width: 200, height: 200}])
  //   console.log("modal init")
  // }

  return (
    <Modalize
      ref={modalizeRef}
      // alwaysOpen={800}
      scrollViewProps={{
        showsVerticalScrollIndicator: false,
      }}
      onClose={() => setOpen(false)}
      // onOpen={() => handleArtworkOpenPress()}
      adjustToContentHeight={true}
      disableScrollIfPossible={false}
      // modalHeight={900}
      modalStyle={{marginBottom: OFFSET}}
      handlePosition='inside'
      velocity={4600} //previous 6800
      threshold={300}
      // childrenStyle={{padding: 8, backgroundColor: currentTheme.colors.background}}
    >
      {renderContent()}
    </Modalize>
  )
}

export default ModalArtwork
